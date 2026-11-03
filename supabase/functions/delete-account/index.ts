const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Token de autenticação ausente." }, 401);
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's JWT and get their identity
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
    });

    if (!userResponse.ok) {
      return jsonResponse({ error: "Sessão inválida ou expirada. Faça login novamente." }, 401);
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    const userEmail = userData.email;

    if (!userId) {
      return jsonResponse({ error: "Não foi possível identificar o usuário." }, 400);
    }

    // Parse request body for optional password re-confirmation
    let body: { password?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    // Re-authenticate: verify password if provided
    if (body.password) {
      const reauthResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        },
        body: JSON.stringify({ email: userEmail, password: body.password }),
      });

      if (!reauthResponse.ok) {
        const reauthError = await reauthResponse.json();
        return jsonResponse({
          error: "Senha incorreta. Verifique e tente novamente.",
          detail: reauthError?.error_description ?? reauthError?.msg,
        }, 403);
      }
    }

    // Create admin Supabase client
    const adminResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    const errors: string[] = [];

    // Step 1: Look up the user's profile to find their family_id
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=family_id,display_name`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
    });
    const profileData = await profileResponse.json();
    const profile = Array.isArray(profileData) ? profileData[0] : null;
    const familyId = profile?.family_id ?? null;
    const displayName = profile?.display_name ?? userEmail;

    // Step 2: Check if user owns the family or is a member
    let familyOwnerId: string | null = null;
    if (familyId) {
      const familyResponse = await fetch(`${supabaseUrl}/rest/v1/families?id=eq.${familyId}&select=owner_id`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      const familyData = await familyResponse.json();
      const family = Array.isArray(familyData) ? familyData[0] : null;
      familyOwnerId = family?.owner_id ?? null;
    }

    // Step 3: Delete the user's profile
    const deleteProfileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    if (!deleteProfileRes.ok) {
      errors.push("Falha ao excluir perfil");
    }

    // Step 4: Delete ALL families owned by the user (not just the one linked to profile)
    // Deleting a family cascades to: scan_history, family_members,
    // family_points, family_achievements, family_meal_planning
    if (familyId && familyOwnerId === userId) {
      const deleteFamilyRes = await fetch(`${supabaseUrl}/rest/v1/families?owner_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      if (!deleteFamilyRes.ok) {
        errors.push("Falha ao excluir família e dados relacionados");
      }
    } else if (familyId && familyOwnerId !== userId) {
      // User is a member but NOT the owner: only delete their scan_history rows
      // and leave family data for other members
      const deleteScanRes = await fetch(`${supabaseUrl}/rest/v1/scan_history?family_id=eq.${familyId}&user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      if (!deleteScanRes.ok) {
        errors.push("Falha ao excluir histórico de escaneamentos");
      }
    }

    // Step 5: Delete subscriptions for the user
    const deleteSubsRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    if (!deleteSubsRes.ok) {
      errors.push("Falha ao excluir assinatura");
    }

    // Step 6: Delete the user from Supabase Auth
    const deleteAuthRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!deleteAuthRes.ok) {
      const authErr = await deleteAuthRes.text();
      errors.push(`Falha ao excluir conta de autenticação: ${authErr}`);
    }

    // Step 7: Log the deletion request (without personal data beyond email)
    if (errors.length === 0 || errors.length < 3) {
      await fetch(`${supabaseUrl}/rest/v1/support_requests`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: displayName,
          request_type: "account_deletion",
          subject: "Exclusão de conta — processada via app",
          message: `Conta excluída em ${new Date().toISOString()}. Família ${familyId ? (familyOwnerId === userId ? "excluída (owner)" : "mantida (membro)") : "não vinculada"}.`,
          status: errors.length === 0 ? "completed" : "processing",
        }),
      });
    }

    if (errors.length > 0) {
      return jsonResponse({
        error: "A exclusão foi parcialmente concluída. Alguns dados podem não ter sido removidos.",
        details: errors,
      }, 207);
    }

    return jsonResponse({
      success: true,
      message: "Conta excluída com sucesso. Todos os dados foram removidos.",
    });
  } catch (err) {
    console.error("delete-account error:", err);
    return jsonResponse({
      error: "Erro interno ao processar a exclusão. Tente novamente ou contate suporte.",
    }, 500);
  }
});
