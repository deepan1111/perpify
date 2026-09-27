const BASE = "http://localhost:5000/api";


async function request(
  path,
  options = {}
) {

  const res =
    await fetch(
      `${BASE}${path}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {}),
        },
      }
    );


  const data =
    await res
      .json()
      .catch(
        () => ({})
      );


  if (!res.ok) {

    throw new Error(
      data.error ||
      "Something went wrong"
    );
  }


  return data;
}


// ======================================================
// AUTH
// ======================================================

export function signup(
  payload
) {

  return request(
    "/auth/signup",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function login(
  payload
) {

  return request(
    "/auth/login",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function fetchMe(
  token
) {

  return request(
    "/auth/me",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}


export function verifyEmail(
  payload
) {

  return request(
    "/auth/verify-email",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function resendOTP(
  email
) {

  return request(
    "/auth/resend-otp",
    {
      method:
        "POST",

      body:
        JSON.stringify({
          email,
        }),
    }
  );
}


// ======================================================
// PUBLIC COMPANIES
// ======================================================

export function fetchPublicCompanies() {

  return request(
    "/companies"
  );
}


// ======================================================
// PUBLIC PACKS
// ======================================================

export function fetchPublishedPacks() {

  return request(
    "/packs"
  );
}


export function fetchPublicPack(
  slug
) {

  return request(
    `/packs/${encodeURIComponent(
      slug
    )}`
  );
}


// ======================================================
// ADMIN COMPANIES
// ======================================================

export function fetchAdminCompanies(
  token
) {

  return request(
    "/admin/companies",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}


export function createAdminCompany(
  token,
  payload
) {

  return request(
    "/admin/companies",
    {
      method:
        "POST",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function deleteAdminCompany(
  token,
  id
) {

  return request(
    `/admin/companies/${id}`,
    {
      method:
        "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}


// ======================================================
// ADMIN PACKS
// ======================================================

export function fetchAdminPacks(
  token
) {

  return request(
    "/admin/packs",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}


export function createAdminPack(
  token,
  payload
) {

  return request(
    "/admin/packs",
    {
      method:
        "POST",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function updateAdminPack(
  token,
  id,
  payload
) {

  return request(
    `/admin/packs/${id}`,
    {
      method:
        "PUT",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export function deleteAdminPack(
  token,
  id
) {

  return request(
    `/admin/packs/${id}`,
    {
      method:
        "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}


export function toggleAdminPackPublished(
  token,
  id
) {

  return request(
    `/admin/packs/${id}/publish`,
    {
      method:
        "PATCH",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
}