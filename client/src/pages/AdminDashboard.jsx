import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";



import "../pages/AdminUI.css";



import {

  fetchAdminCompanies,

  fetchAdminPacks,

  createAdminCompany,

  createAdminPack,

  deleteAdminCompany,

  deleteAdminPack,

  toggleAdminPackPublished,

} from "../lib/api.js";



const API = "http://localhost:5000/api";



/* =========================================================

   DEFAULT FORM VALUES

========================================================= */



const emptyRound = () => ({

  name: "",

  howToPrepare: "",

  material: {

    name: "",

    url: "",

    type: "pdf",

  },

  order: 1,

});



const initialPackForm = {

  company: "",

  role: "",

  title: "",

  preparation: "",

  rounds: [emptyRound()],

  price: "",

};



/* =========================================================

   MAIN ADMIN DASHBOARD

========================================================= */



export default function AdminDashboard() {

  const navigate = useNavigate();



  const [admin, setAdmin] = useState(null);



  const [activePage, setActivePage] = useState("overview");

  const [sidebarOpen, setSidebarOpen] = useState(false);



  /* =======================================================

     MONGODB DATA

  ======================================================= */



  const [companies, setCompanies] = useState([]);

  const [packs, setPacks] = useState([]);



  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const [loadingPacks, setLoadingPacks] = useState(true);



  /* =======================================================

     MODALS

  ======================================================= */



  const [showCompanyModal, setShowCompanyModal] = useState(false);

  const [showPackModal, setShowPackModal] = useState(false);



  /* =======================================================

     COMPANY FORM

  ======================================================= */



  const [companyForm, setCompanyForm] = useState({

    name: "",

    description: "",

  });



  const [savingCompany, setSavingCompany] = useState(false);



  /* =======================================================

     PACK FORM

  ======================================================= */



  const [packForm, setPackForm] = useState(initialPackForm);



  const [savingPack, setSavingPack] = useState(false);



  /* =======================================================

     ADMIN AUTHENTICATION

  ======================================================= */



  useEffect(() => {

    async function checkAdmin() {

      try {

        const token = localStorage.getItem("token");



        if (!token) {

          navigate("/login");

          return;

        }



        const response = await fetch(`${API}/admin/test`, {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });



        const data = await response.json();



        if (!response.ok) {

          throw new Error(

            data.error || "Admin authentication failed"

          );

        }



        setAdmin(data.admin);

      } catch (error) {

        console.error(error);



        localStorage.removeItem("token");

        navigate("/login");

      }

    }



    checkAdmin();

  }, [navigate]);



  /* =======================================================

     LOAD ADMIN DATA

  ======================================================= */



  useEffect(() => {

    if (!admin) return;



    loadAdminData();

  }, [admin]);



  async function loadAdminData() {

    const token = localStorage.getItem("token");



    if (!token) {

      navigate("/login");

      return;

    }



    try {

      setLoadingCompanies(true);

      setLoadingPacks(true);



      const [companiesData, packsData] = await Promise.all([

        fetchAdminCompanies(token),

        fetchAdminPacks(token),

      ]);



      setCompanies(companiesData.companies || []);

      setPacks(packsData.packs || []);

    } catch (error) {

      console.error(error);



      if (

        error.message

          .toLowerCase()

          .includes("authentication")

      ) {

        localStorage.removeItem("token");

        navigate("/login");

        return;

      }



      alert(error.message);

    } finally {

      setLoadingCompanies(false);

      setLoadingPacks(false);

    }

  }



  /* =======================================================

     LOGOUT

  ======================================================= */



  function logout() {

    localStorage.removeItem("token");

    navigate("/login");

  }



  /* =======================================================

     CREATE COMPANY

  ======================================================= */



  async function createCompany(e) {

    e.preventDefault();



    const name = companyForm.name.trim();



    if (!name) {

      alert("Please enter a company name");

      return;

    }



    try {

      setSavingCompany(true);



      const token = localStorage.getItem("token");



      if (!token) {

        navigate("/login");

        return;

      }



      const data = await createAdminCompany(token, {

        name,

        description: companyForm.description.trim(),

      });



      setCompanies((current) => [

        data.company,

        ...current,

      ]);



      setCompanyForm({

        name: "",

        description: "",

      });



      setShowCompanyModal(false);



      alert("Company created successfully.");

    } catch (error) {

      console.error("Create company error:", error);

      alert(error.message);

    } finally {

      setSavingCompany(false);

    }

  }



  /* =======================================================

     RESET PACK FORM

  ======================================================= */



  function resetPackForm() {

    setPackForm({

      company: "",

      role: "",

      title: "",

      preparation: "",

      rounds: [emptyRound()],

      price: "",

    });

  }



  /* =======================================================

     CREATE PACK

  ======================================================= */



  async function createPack(e) {

    e.preventDefault();



    if (!packForm.company) {

      alert("Please select a company.");

      return;

    }



    if (!packForm.role.trim()) {

      alert("Please enter the role.");

      return;

    }



    if (!packForm.title.trim()) {

      alert("Please enter the pack title.");

      return;

    }



    if (!packForm.preparation.trim()) {

      alert("Please enter the preparation guide.");

      return;

    }



    const validRounds = packForm.rounds
      .filter((round) => round.name.trim())
      .map((round, index) => {
        const materialUrl = round.material?.url?.trim() || "";
        const enteredMaterialName =
          round.material?.name?.trim() || "";

        // If the admin enters only a URL, derive a readable
        // material name so the user page can display the resource.
        let materialName = enteredMaterialName;

        if (!materialName && materialUrl) {
          try {
            const pathname = new URL(materialUrl).pathname;
            const lastPart = pathname.split("/").filter(Boolean).pop();

            materialName =
              decodeURIComponent(lastPart || "").trim() ||
              "Interview Material";
          } catch {
            materialName = "Interview Material";
          }
        }

        return {
          name: round.name.trim(),
          howToPrepare: round.howToPrepare.trim(),
          material: {
            name: materialName,
            url: materialUrl,
            type: round.material?.type?.trim() || "pdf",
          },
          order: index + 1,
        };
      });

    const invalidMaterialRound = validRounds.find(
      (round) =>
        round.material.name &&
        !round.material.url
    );

    if (invalidMaterialRound) {
      alert(
        `Please add a File URL for "${invalidMaterialRound.name}" or remove the material name.`
      );
      return;
    }

    if (validRounds.length === 0) {

      alert("Please add at least one interview round.");

      return;

    }



    try {

      setSavingPack(true);



      const token = localStorage.getItem("token");



      if (!token) {

        navigate("/login");

        return;

      }



      const payload = {

        companyId: packForm.company,



        role: packForm.role.trim(),



        title: packForm.title.trim(),



        preparation: packForm.preparation.trim(),



        rounds: validRounds,



        price: Number(packForm.price) || 0,

      };



      console.log(

        "Creating preparation pack:",

        payload

      );



      const data = await createAdminPack(

        token,

        payload

      );



      setPacks((current) => [

        data.pack,

        ...current,

      ]);



      /* Refresh company pack counts */



      const companiesData =

        await fetchAdminCompanies(token);



      setCompanies(

        companiesData.companies || []

      );



      resetPackForm();



      setShowPackModal(false);



      alert(

        "Preparation pack created successfully!"

      );

    } catch (error) {

      console.error(

        "Create pack error:",

        error

      );



      alert(error.message);

    } finally {

      setSavingPack(false);

    }

  }



  /* =======================================================

     ROUND FUNCTIONS

  ======================================================= */



  function addRound() {

    setPackForm((current) => ({

      ...current,

      rounds: [

        ...current.rounds,

        emptyRound(),

      ],

    }));

  }



  function removeRound(index) {

    setPackForm((current) => {

      if (current.rounds.length === 1) {

        return current;

      }



      return {

        ...current,

        rounds: current.rounds.filter(

          (_, i) => i !== index

        ),

      };

    });

  }



  function updateRound(

    index,

    field,

    value

  ) {

    updateRoundField(index, field, value);

  }



  function updateRoundField(index, field, value) {

    setPackForm((current) => ({

      ...current,

      rounds: current.rounds.map((round, i) =>

        i === index

          ? {

              ...round,

              [field]: value,

            }

          : round

      ),

    }));

  }



  function updateRoundMaterial(index, field, value) {

    setPackForm((current) => ({

      ...current,

      rounds: current.rounds.map((round, i) =>

        i === index

          ? {

              ...round,

              material: {

                ...(round.material || {}),

                [field]: value,

              },

            }

          : round

      ),

    }));

  }



  /* =======================================================

     DELETE COMPANY

  ======================================================= */



  async function deleteCompany(id) {

    const company = companies.find(

      (item) => item.id === id

    );



    if (!company) return;



    const confirmed = window.confirm(

      `Delete ${company.name}? This will also remove its packs.`

    );



    if (!confirmed) return;



    try {

      const token = localStorage.getItem("token");



      await deleteAdminCompany(token, id);



      setCompanies((current) =>

        current.filter(

          (item) => item.id !== id

        )

      );



      setPacks((current) =>

        current.filter(

          (item) => item.companyId !== id

        )

      );

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  }



  /* =======================================================

     DELETE PACK

  ======================================================= */



  async function deletePack(id) {

    const pack = packs.find(

      (item) => item.id === id

    );



    if (!pack) return;



    const confirmed = window.confirm(

      `Delete "${pack.title}"?`

    );



    if (!confirmed) return;



    try {

      const token = localStorage.getItem("token");



      await deleteAdminPack(token, id);



      setPacks((current) =>

        current.filter(

          (item) => item.id !== id

        )

      );



      const companiesData =

        await fetchAdminCompanies(token);



      setCompanies(

        companiesData.companies || []

      );

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  }



  /* =======================================================

     PUBLISH / UNPUBLISH

  ======================================================= */



  async function togglePublished(id) {

    try {

      const token = localStorage.getItem("token");



      const data =

        await toggleAdminPackPublished(

          token,

          id

        );



      setPacks((current) =>

        current.map((pack) =>

          pack.id === id

            ? {

                ...pack,

                published: data.published,

              }

            : pack

        )

      );

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  }



  /* =======================================================

     COPY SHARE LINK

  ======================================================= */



  async function sharePack(pack) {

    const url =

      `${window.location.origin}/pack/${pack.slug}`;



    try {

      await navigator.clipboard.writeText(url);



      alert(

        "Share link copied!\n\n" + url

      );

    } catch {

      window.prompt(

        "Copy this link:",

        url

      );

    }

  }



  /* =======================================================

     STATISTICS

  ======================================================= */



  const totalSales = useMemo(

    () =>

      packs.reduce(

        (sum, pack) =>

          sum +

          Number(pack.sales || 0),

        0

      ),

    [packs]

  );



  const totalRevenue = useMemo(

    () =>

      packs.reduce(

        (sum, pack) =>

          sum +

          Number(pack.sales || 0) *

            Number(pack.price || 0),

        0

      ),

    [packs]

  );



  const publishedPacks =

    packs.filter(

      (pack) => pack.published

    ).length;



  const stats = [

    {

      label: "Companies",

      value: companies.length,

      icon: "🏢",

      description: "Companies added",

    },

    {

      label: "Prep Packs",

      value: packs.length,

      icon: "📦",

      description:

        "Total preparation packs",

    },

    {

      label: "Published",

      value: publishedPacks,

      icon: "🌐",

      description:

        "Packs live publicly",

    },

    {

      label: "Sales",

      value: totalSales,

      icon: "💳",

      description:

        "Total purchases",

    },

  ];



  /* =======================================================

     PAGE TITLE

  ======================================================= */



  const pageTitle =

    activePage === "overview"

      ? "Dashboard"

      : activePage === "companies"

      ? "Companies"

      : "Prep Packs";



  /* =======================================================

     LOADING

  ======================================================= */



  if (!admin) {

    return (

      <div className="admin-loading">

        <div className="loading-spinner" />



        <p>

          Loading admin dashboard...

        </p>

      </div>

    );

  }



  /* =======================================================

     UI

  ======================================================= */



  return (

    <div className="admin-app">



      {/* =================================================

          SIDEBAR

      ================================================= */}



      <aside

        className={`admin-sidebar ${

          sidebarOpen

            ? "sidebar-open"

            : ""

        }`}

      >



        <div className="sidebar-brand">



          <div className="brand-mark">

            P

          </div>



          <div>

            <div className="brand-name">

                      <div className="dashboard-brand">
                            <img
                         src={logo}
                         alt="Prepify"
                         className="dashboard-logo"
                         style={{
                           width: "150px",
                           height: "auto",
                           display: "block",
                           objectFit: "contain",
                         }}
                       />
                          </div>

            </div>



            <div className="brand-label">

              ADMIN PANEL

            </div>

          </div>



        </div>



        <nav className="sidebar-nav">



          <div className="nav-section-title">

            MANAGEMENT

          </div>



          {/* OVERVIEW */}



          <button

            className={`nav-item ${

              activePage === "overview"

                ? "active"

                : ""

            }`}

            onClick={() => {

              setActivePage("overview");

              setSidebarOpen(false);

            }}

          >

            <span>▦</span>

            <span>Overview</span>

          </button>



          {/* COMPANIES */}



          <button

            className={`nav-item ${

              activePage === "companies"

                ? "active"

                : ""

            }`}

            onClick={() => {

              setActivePage("companies");

              setSidebarOpen(false);

            }}

          >

            <span>🏢</span>

            <span>Companies</span>



            <span className="nav-count">

              {companies.length}

            </span>

          </button>



          {/* PREP PACKS */}



          <button

            className={`nav-item ${

              activePage === "packs"

                ? "active"

                : ""

            }`}

            onClick={() => {

              setActivePage("packs");

              setSidebarOpen(false);

            }}

          >

            <span>📦</span>

            <span>Prep Packs</span>



            <span className="nav-count">

              {packs.length}

            </span>

          </button>



          <div className="nav-section-title">

            SYSTEM

          </div>



          <button

            className="nav-item"

            onClick={() =>

              alert(

                "Settings will be added later."

              )

            }

          >

            <span>⚙</span>

            <span>Settings</span>

          </button>



        </nav>



        <div className="sidebar-bottom">



          <div className="admin-mini-profile">



            <div className="avatar">

              {admin

                .charAt(0)

                .toUpperCase()}

            </div>



            <div className="profile-info">

              <strong>

                Administrator

              </strong>



              <span>

                {admin}

              </span>

            </div>



          </div>



          <button

            className="logout-button"

            onClick={logout}

          >

            <span>↪</span>

            <span>Logout</span>

          </button>



        </div>



      </aside>



      {/* MOBILE OVERLAY */}



      {sidebarOpen && (

        <div

          className="sidebar-overlay"

          onClick={() =>

            setSidebarOpen(false)

          }

        />

      )}



      {/* =================================================

          MAIN

      ================================================= */}



      <main className="admin-main">



        <header className="admin-header">



          <button

            className="mobile-menu"

            onClick={() =>

              setSidebarOpen(true)

            }

          >

            ☰

          </button>



          <div>



            <div className="header-eyebrow">

              Prepify Admin Panel

            </div>



            <h1>

              {pageTitle}

            </h1>



          </div>



          <div className="header-actions">



            <button

              className="view-site"

              onClick={() =>

                navigate("/")

              }

            >

              View site ↗

            </button>



            <div className="header-avatar">

              {admin

                .charAt(0)

                .toUpperCase()}

            </div>



          </div>



        </header>



        <section className="admin-content">



          {activePage === "overview" && (

            <OverviewPage

              stats={stats}

              packs={packs}

              totalRevenue={totalRevenue}

              loadingPacks={loadingPacks}

              setActivePage={

                setActivePage

              }

            />

          )}



          {activePage === "companies" && (

            <CompaniesPage

              companies={companies}

              loading={

                loadingCompanies

              }

              onCreate={() =>

                setShowCompanyModal(

                  true

                )

              }

              onDelete={deleteCompany}

            />

          )}



          {activePage === "packs" && (

            <PacksPage

              packs={packs}

              loading={loadingPacks}

              onCreate={() =>

                setShowPackModal(true)

              }

              onTogglePublished={

                togglePublished

              }

              onDelete={deletePack}

              onShare={sharePack}

            />

          )}



        </section>



      </main>



      {/* =================================================

          COMPANY MODAL

      ================================================= */}



      {showCompanyModal && (

        <div className="modal-backdrop">



          <div className="modal">



            <div className="modal-header">



              <div>



                <div className="modal-eyebrow">

                  NEW COMPANY

                </div>



                <h2>

                  Add company

                </h2>



              </div>



              <button

                className="modal-close"

                onClick={() =>

                  setShowCompanyModal(

                    false

                  )

                }

              >

                ×

              </button>



            </div>



            <form

              onSubmit={createCompany}

            >



              <label>

                Company name



                <input

                  autoFocus

                  required

                  value={

                    companyForm.name

                  }

                  onChange={(e) =>

                    setCompanyForm(

                      (current) => ({

                        ...current,

                        name:

                          e.target.value,

                      })

                    )

                  }

                  placeholder="e.g. Infosys"

                />

              </label>



              <label>

                Description



                <textarea

                  value={

                    companyForm.description

                  }

                  onChange={(e) =>

                    setCompanyForm(

                      (current) => ({

                        ...current,

                        description:

                          e.target.value,

                      })

                    )

                  }

                  placeholder="Short company description..."

                  rows="4"

                />

              </label>



              <div className="modal-actions">



                <button

                  type="button"

                  className="button-secondary"

                  onClick={() =>

                    setShowCompanyModal(

                      false

                    )

                  }

                  disabled={

                    savingCompany

                  }

                >

                  Cancel

                </button>



                <button

                  type="submit"

                  className="button-primary"

                  disabled={

                    savingCompany

                  }

                >

                  {savingCompany

                    ? "Creating..."

                    : "Create company"}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}



      {/* =================================================

          NEW PREPARATION PACK MODAL

      ================================================= */}



      {showPackModal && (

        <div className="modal-backdrop">



          <div

            className="modal"

            style={{

              width:

                "min(1000px, 96vw)",

              maxHeight: "92vh",

              overflowY: "auto",

            }}

          >



            {/* HEADER */}



            <div className="modal-header">



              <div>



                <div className="modal-eyebrow">

                  NEW PREPARATION PRODUCT

                </div>



                <h2>

                  Create prep pack

                </h2>



                <p

                  style={{

                    margin:

                      "6px 0 0",

                    color:

                      "#737373",

                    fontSize:

                      "14px",

                  }}

                >

                  Build a complete

                  interview preparation

                  product for a specific

                  company and role.

                </p>



              </div>



              <button

                type="button"

                className="modal-close"

                onClick={() => {

                  if (!savingPack) {

                    setShowPackModal(

                      false

                    );

                  }

                }}

              >

                ×

              </button>



            </div>



            <form

              onSubmit={createPack}

            >



              {/* =================================================

                  BASIC INFORMATION

              ================================================= */}



              <div

                style={{

                  marginBottom:

                    "28px",

                }}

              >



                <SectionHeader

                  number="01"

                  title="Basic information"

                  description="Define the company, role and product title."

                />



                <div

                  style={{

                    display: "grid",

                    gridTemplateColumns:

                      "1fr 1fr",

                    gap: "18px",

                  }}

                >



                  {/* COMPANY */}



                  <label>

                    Company



                    <select

                      required

                      value={

                        packForm.company

                      }

                      onChange={(e) =>

                        setPackForm(

                          (current) => ({

                            ...current,

                            company:

                              e.target.value,

                          })

                        )

                      }

                    >

                      <option value="">

                        Select company

                      </option>



                      {companies.map(

                        (company) => (

                          <option

                            key={

                              company.id

                            }

                            value={

                              company.id

                            }

                          >

                            {company.name}

                          </option>

                        )

                      )}

                    </select>

                  </label>



                  {/* ROLE */}



                  <label>

                    Role



                    <input

                      required

                      value={

                        packForm.role

                      }

                      onChange={(e) =>

                        setPackForm(

                          (current) => ({

                            ...current,

                            role:

                              e.target.value,

                          })

                        )

                      }

                      placeholder="e.g. System Engineer"

                    />

                  </label>



                </div>



                {/* TITLE */}



                <label

                  style={{

                    marginTop:

                      "18px",

                  }}

                >

                  Pack title



                  <input

                    required

                    value={

                      packForm.title

                    }

                    onChange={(e) =>

                      setPackForm(

                        (current) => ({

                          ...current,

                          title:

                            e.target.value,

                        })

                      )

                    }

                    placeholder="e.g. Infosys System Engineer Complete Preparation"

                  />

                </label>



              </div>



              {/* =================================================

                  PREPARATION GUIDE

              ================================================= */}



              <div

                style={{

                  marginBottom:

                    "28px",

                }}

              >



                <SectionHeader

                  number="02"

                  title="How to prepare"

                  description="Give the candidate a clear preparation strategy."

                />



                <label>

                  Preparation guide



                  <textarea

                    required

                    value={

                      packForm.preparation

                    }

                    onChange={(e) =>

                      setPackForm(

                        (current) => ({

                          ...current,

                          preparation:

                            e.target.value,

                        })

                      )

                    }

                    placeholder={`Example:



Start with aptitude and reasoning.

Revise C programming fundamentals.

Practice SQL queries every day.

Complete the previous-year questions.

Prepare common HR questions before the interview.`}

                    rows="8"

                    style={{

                      width: "100%",

                      resize:

                        "vertical",

                    }}

                  />

                </label>



              </div>



              {/* =================================================

                  INTERVIEW ROUNDS

              ================================================= */}



              <div

                style={{

                  marginBottom:

                    "28px",

                }}

              >



                <SectionHeader

                  number="03"

                  title="Interview rounds"

                  description="Each round contains its own preparation guide and material / question file."

                  action={

                    <button

                      type="button"

                      className="small-button"

                      onClick={addRound}

                    >

                      + Add interview round

                    </button>

                  }

                />



                <div

                  style={{

                    display: "flex",

                    flexDirection: "column",

                    gap: "14px",

                  }}

                >



                  {packForm.rounds.map(

                    (round, index) => (

                      <div

                        key={index}

                        style={{

                          border:

                            "1px solid #e5e5e5",

                          borderRadius:

                            "12px",

                          padding:

                            "18px",

                          background:

                            "#fafafa",

                        }}

                      >



                        <div

                          style={{

                            display: "flex",

                            justifyContent:

                              "space-between",

                            alignItems:

                              "center",

                            marginBottom:

                              "16px",

                          }}

                        >



                          <div>

                            <strong

                              style={{

                                fontSize:

                                  "14px",

                              }}

                            >

                              Round {index + 1}

                            </strong>



                            <div

                              style={{

                                marginTop:

                                  "4px",

                                fontSize:

                                  "12px",

                                color:

                                  "#888",

                              }}

                            >

                              Preparation and material for this round

                            </div>

                          </div>



                          {packForm.rounds.length > 1 && (

                            <button

                              type="button"

                              onClick={() =>

                                removeRound(index)

                              }

                              style={{

                                border: "none",

                                background:

                                  "transparent",

                                color:

                                  "#b91c1c",

                                cursor:

                                  "pointer",

                                fontWeight:

                                  600,

                              }}

                            >

                              Remove

                            </button>

                          )}



                        </div>



                        <label>

                          Round name



                          <input

                            required

                            value={round.name}

                            onChange={(e) =>

                              updateRound(

                                index,

                                "name",

                                e.target.value

                              )

                            }

                            placeholder="e.g. Technical Interview"

                          />

                        </label>



                        <label

                          style={{

                            marginTop:

                              "14px",

                          }}

                        >

                          How to prepare



                          <textarea

                            value={

                              round.howToPrepare

                            }

                            onChange={(e) =>

                              updateRound(

                                index,

                                "howToPrepare",

                                e.target.value

                              )

                            }

                            placeholder={`Example:



Revise C, Java, SQL and OOP.

Practice coding problems and previous-year questions.

Prepare to explain your projects clearly.`}

                            rows="5"

                            style={{

                              width: "100%",

                              resize:

                                "vertical",

                            }}

                          />

                        </label>



                        <div

                          style={{

                            marginTop:

                              "18px",

                            padding:

                              "16px",

                            border:

                              "1px solid #e5e5e5",

                            borderRadius:

                              "10px",

                            background:

                              "#fff",

                          }}

                        >



                          <div

                            style={{

                              fontSize:

                                "13px",

                              fontWeight:

                                700,

                              marginBottom:

                                "12px",

                            }}

                          >

                            Material / Question File

                          </div>



                          <div

                            style={{

                              display: "grid",

                              gridTemplateColumns:

                                "2fr 1fr",

                              gap: "14px",

                            }}

                          >



                            <label>

                              File / material name



                              <input

                                value={

                                  round.material

                                    ?.name || ""

                                }

                                onChange={(e) =>

                                  updateRoundMaterial(

                                    index,

                                    "name",

                                    e.target.value

                                  )

                                }

                                placeholder="e.g. Technical Interview PYQs"

                              />

                            </label>



                            <label>

                              Type



                              <select

                                value={

                                  round.material

                                    ?.type || "pdf"

                                }

                                onChange={(e) =>

                                  updateRoundMaterial(

                                    index,

                                    "type",

                                    e.target.value

                                  )

                                }

                              >

                                <option value="pdf">

                                  PDF

                                </option>

                                <option value="document">

                                  Document

                                </option>

                                <option value="video">

                                  Video

                                </option>

                                <option value="link">

                                  Link

                                </option>

                                <option value="other">

                                  Other

                                </option>

                              </select>

                            </label>



                          </div>



                          <label

                            style={{

                              marginTop:

                                "14px",

                            }}

                          >

                            File URL



                            <input

                              type="url"

                              value={

                                round.material

                                  ?.url || ""

                              }

                              onChange={(e) =>

                                updateRoundMaterial(

                                  index,

                                  "url",

                                  e.target.value

                                )

                              }

                              placeholder="https://..."

                            />



                            <span

                              style={{

                                display:

                                  "block",

                                marginTop:

                                  "6px",

                                fontSize:

                                  "12px",

                                color:

                                  "#888",

                              }}

                            >

                              The file/resource URL is stored inside this interview round.

                            </span>

                          </label>



                        </div>



                      </div>

                    )

                  )}



                </div>



              </div>



              {/* =================================================

                  PRICE

              ================================================= */}



              <div

                style={{

                  marginBottom:

                    "28px",

                }}

              >



                <SectionHeader

                  number="06"

                  title="Pricing"

                  description="Set the amount users pay to unlock this preparation pack."

                />



                <label

                  style={{

                    maxWidth:

                      "300px",

                  }}

                >

                  Price



                  <div

                    className="price-input"

                  >

                    <span>

                      ₹

                    </span>



                    <input

                      type="number"

                      min="0"

                      step="1"

                      value={

                        packForm.price

                      }

                      onChange={(e) =>

                        setPackForm(

                          (current) => ({

                            ...current,

                            price:

                              e.target

                                .value,

                          })

                        )

                      }

                      placeholder="199"

                    />

                  </div>

                </label>



              </div>



              {/* =================================================

                  PREVIEW

              ================================================= */}



              <div

                style={{

                  border:

                    "1px solid #e5e5e5",

                  borderRadius:

                    "14px",

                  padding:

                    "20px",

                  marginBottom:

                    "24px",

                  background:

                    "#f8f8f8",

                }}

              >



                <div

                  style={{

                    fontSize:

                      "11px",

                    fontWeight:

                      700,

                    letterSpacing:

                      "0.12em",

                    color:

                      "#777",

                    marginBottom:

                      "8px",

                  }}

                >

                  PRODUCT PREVIEW

                </div>



                <h3

                  style={{

                    margin:

                      "0 0 6px",

                    fontSize:

                      "20px",

                  }}

                >

                  {packForm.title ||

                    "Your preparation pack title"}

                </h3>



                <p

                  style={{

                    margin:

                      "0 0 14px",

                    color:

                      "#666",

                  }}

                >

                  {packForm.company

                    ? companies.find(

                        (company) =>

                          String(

                            company.id

                          ) ===

                          String(

                            packForm.company

                          )

                      )?.name

                    : "Company"}{" "}

                  •{" "}

                  {packForm.role ||

                    "Role"}

                </p>



                <div

                  style={{

                    display:

                      "flex",

                    gap: "8px",

                    flexWrap:

                      "wrap",

                  }}

                >



                  <PreviewBadge

                    text={`${packForm.rounds.filter(

                      (round) =>

                        round.name.trim()

                    ).length} rounds`}

                  />



                  <PreviewBadge

                    text={`${packForm.rounds.filter(

                      (round) =>

                        round.material?.name?.trim() &&

                        round.material?.url?.trim()

                    ).length} round files`}

                  />



                  <PreviewBadge

                    text={`₹${

                      Number(

                        packForm.price

                      ) || 0

                    }`}

                  />



                </div>



              </div>



              {/* =================================================

                  FORM ACTIONS

              ================================================= */}



              <div className="modal-actions">



                <button

                  type="button"

                  className="button-secondary"

                  onClick={() => {

                    if (

                      savingPack

                    )

                      return;



                    resetPackForm();



                    setShowPackModal(

                      false

                    );

                  }}

                  disabled={

                    savingPack

                  }

                >

                  Cancel

                </button>



                <button

                  type="submit"

                  className="button-primary"

                  disabled={

                    savingPack ||

                    companies.length ===

                      0

                  }

                >

                  {savingPack

                    ? "Creating pack..."

                    : "Create preparation pack"}

                </button>



              </div>



            </form>



          </div>



        </div>

      )}



    </div>

  );

}



/* =========================================================

   SECTION HEADER

========================================================= */



function SectionHeader({

  number,

  title,

  description,

  action,

}) {

  return (

    <div

      style={{

        display: "flex",

        justifyContent:

          "space-between",

        alignItems:

          "flex-start",

        gap: "16px",

        marginBottom:

          "16px",

      }}

    >



      <div

        style={{

          display:

            "flex",

          gap: "12px",

        }}

      >



        <div

          style={{

            width: "32px",

            height: "32px",

            borderRadius:

              "9px",

            background:

              "#111",

            color: "#fff",

            display:

              "flex",

            alignItems:

              "center",

            justifyContent:

              "center",

            fontSize:

              "11px",

            fontWeight:

              700,

          }}

        >

          {number}

        </div>



        <div>



          <h3

            style={{

              margin:

                "0 0 4px",

              fontSize:

                "17px",

            }}

          >

            {title}

          </h3>



          <p

            style={{

              margin: 0,

              color:

                "#777",

              fontSize:

                "13px",

            }}

          >

            {description}

          </p>



        </div>



      </div>



      {action}



    </div>

  );

}



/* =========================================================

   PREVIEW BADGE

========================================================= */



function PreviewBadge({

  text,

}) {

  return (

    <span

      style={{

        display:

          "inline-flex",

        alignItems:

          "center",

        padding:

          "7px 10px",

        borderRadius:

          "999px",

        background:

          "#fff",

        border:

          "1px solid #dedede",

        fontSize:

          "12px",

        fontWeight:

          600,

      }}

    >

      {text}

    </span>

  );

}



/* =========================================================

   OVERVIEW

========================================================= */



function OverviewPage({

  stats,

  packs,

  totalRevenue,

  loadingPacks,

  setActivePage,

}) {

  return (

    <div>



      <div className="welcome-row">



        <div>



          <h2>

            Good evening, Admin.

          </h2>



          <p>

            Here's what's happening

            with Prepify.

          </p>



        </div>



      </div>



      {/* STATS */}



      <div className="stats-grid">



        {stats.map((stat) => (

          <div

            className="stat-card"

            key={stat.label}

          >



            <div className="stat-top">



              <div className="stat-icon">

                {stat.icon}

              </div>



              <span className="stat-arrow">

                ↗

              </span>



            </div>



            <div className="stat-value">

              {stat.value}

            </div>



            <div className="stat-label">

              {stat.label}

            </div>



            <div className="stat-description">

              {stat.description}

            </div>



          </div>

        ))}



      </div>



      {/* REVENUE */}



      <div className="revenue-card">



        <div>



          <div className="section-eyebrow">

            TOTAL REVENUE

          </div>



          <h2>

            ₹

            {totalRevenue.toLocaleString(

              "en-IN"

            )}

          </h2>



          <p>

            Revenue from recorded sales

          </p>



        </div>



        <div className="revenue-symbol">

          ₹

        </div>



      </div>



      {/* QUICK ACTIONS */}



      <div className="section-heading">



        <div>



          <div className="section-eyebrow">

            QUICK ACTIONS

          </div>



          <h2>

            Manage your content

          </h2>



        </div>



      </div>



      <div className="quick-grid">



        <button

          className="quick-card"

          onClick={() =>

            setActivePage(

              "companies"

            )

          }

        >



          <div className="quick-icon">

            🏢

          </div>



          <div>



            <strong>

              Manage companies

            </strong>



            <span>

              Add or remove companies

            </span>



          </div>



          <span className="quick-arrow">

            →

          </span>



        </button>



        <button

          className="quick-card"

          onClick={() =>

            setActivePage("packs")

          }

        >



          <div className="quick-icon">

            📦

          </div>



          <div>



            <strong>

              Manage prep packs

            </strong>



            <span>

              Create and publish packs

            </span>



          </div>



          <span className="quick-arrow">

            →

          </span>



        </button>



      </div>



      {/* RECENT PACKS */}



      <div className="section-heading">



        <div>



          <div className="section-eyebrow">

            RECENT CONTENT

          </div>



          <h2>

            Prep packs

          </h2>



        </div>



        <button

          className="text-button"

          onClick={() =>

            setActivePage("packs")

          }

        >

          View all →

        </button>



      </div>



      <div className="table-card">



        <div className="table-header">

          <span>PACK</span>

          <span>COMPANY</span>

          <span>PRICE</span>

          <span>STATUS</span>

        </div>



        {loadingPacks ? (

          <div className="table-row">

            Loading packs...

          </div>

        ) : packs.length === 0 ? (

          <div className="table-row">

            No prep packs created yet.

          </div>

        ) : (

          packs

            .slice(0, 5)

            .map((pack) => (

              <div

                className="table-row"

                key={pack.id}

              >



                <div className="pack-name">



                  <div className="pack-mini-icon">

                    📄

                  </div>



                  <div>



                    <strong>

                      {pack.title}

                    </strong>



                    <span>

                      {pack.roundCount ||

                        pack.rounds?.length ||

                        0}{" "}

                      rounds

                    </span>



                  </div>



                </div>



                <span>

                  {pack.company}

                </span>



                <strong>

                  ₹{pack.price}

                </strong>



                <span

                  className={`status ${

                    pack.published

                      ? "published"

                      : "draft"

                  }`}

                >

                  {pack.published

                    ? "Published"

                    : "Draft"}

                </span>



              </div>

            ))

        )}



      </div>



    </div>

  );

}



/* =========================================================

   COMPANIES

========================================================= */



function CompaniesPage({

  companies,

  loading,

  onCreate,

  onDelete,

}) {

  return (

    <div>



      <div className="page-top">



        <div>



          <div className="section-eyebrow">

            CONTENT

          </div>



          <h2>

            Companies

          </h2>



          <p>

            Manage the companies

            available on Prepify.

          </p>



        </div>



        <button

          className="button-primary"

          onClick={onCreate}

        >

          + Add company

        </button>



      </div>



      {loading ? (

        <div className="empty-state">

          Loading companies...

        </div>

      ) : companies.length === 0 ? (

        <div className="empty-state">



          <h3>

            No companies yet

          </h3>



          <p>

            Add your first company to

            start creating prep packs.

          </p>



        </div>

      ) : (

        <div className="company-grid">



          {companies.map(

            (company) => (

              <div

                className="company-card"

                key={company.id}

              >



                <div className="company-card-top">



                  <div className="company-logo">

                    {company.name

                      .charAt(0)

                      .toUpperCase()}

                  </div>



                  <button

                    className="more-button"

                    onClick={() =>

                      onDelete(

                        company.id

                      )

                    }

                    title="Delete company"

                  >

                    ⋮

                  </button>



                </div>



                <h3>

                  {company.name}

                </h3>



                <p>

                  /{company.slug}

                </p>



                <div className="company-footer">



                  <span>

                    📦 {company.packs || 0}{" "}

                    packs

                  </span>



                  <span className="status published">

                    {company.status ||

                      "Active"}

                  </span>



                </div>



              </div>

            )

          )}



        </div>

      )}



    </div>

  );

}



/* =========================================================

   PREP PACKS

========================================================= */



function PacksPage({

  packs,

  loading,

  onCreate,

  onTogglePublished,

  onDelete,

  onShare,

}) {

  return (

    <div>



      <div className="page-top">



        <div>



          <div className="section-eyebrow">

            CONTENT

          </div>



          <h2>

            Prep Packs

          </h2>



          <p>

            Create, publish and manage

            interview preparation

            products.

          </p>



        </div>



        <button

          className="button-primary"

          onClick={onCreate}

        >

          + Create pack

        </button>



      </div>



      {loading ? (

        <div className="empty-state">

          Loading prep packs...

        </div>

      ) : packs.length === 0 ? (

        <div className="empty-state">



          <h3>

            No prep packs yet

          </h3>



          <p>

            Create a pack after adding

            a company.

          </p>



        </div>

      ) : (

        <div className="packs-list">



          {packs.map(

            (pack) => (

              <div

                className="pack-card"

                key={pack.id}

              >



                <div className="pack-card-icon">

                  📦

                </div>



                <div className="pack-card-main">



                  <div className="pack-company">

                    {pack.company}

                  </div>



                  <h3>

                    {pack.title}

                  </h3>



                  <p>

                    {pack.role

                      ? `${pack.role} • `

                      : ""}

                    /pack/{pack.slug}

                  </p>



                  <div className="pack-meta">



                    <span>

                      🎯{" "}

                      {pack.roundCount ||

                        pack.rounds?.length ||

                        0}{" "}

                      rounds

                    </span>



                    <span>

                      📄{" "}

                      {pack.rounds?.filter(

                        (round) =>

                          round.material?.name

                      ).length ||

                        0}{" "}

                      round files

                    </span>



                    <span>

                      💳{" "}

                      {pack.sales || 0}{" "}

                      sales

                    </span>



                    <strong>

                      ₹{pack.price}

                    </strong>



                  </div>



                </div>



                <div className="pack-card-right">



                  <span

                    className={`status ${

                      pack.published

                        ? "published"

                        : "draft"

                    }`}

                  >

                    {pack.published

                      ? "Published"

                      : "Draft"}

                  </span>



                  <div className="pack-actions">



                    <button

                      className="small-button"

                      onClick={() =>

                        onTogglePublished(

                          pack.id

                        )

                      }

                    >

                      {pack.published

                        ? "Unpublish"

                        : "Publish"}

                    </button>



                    <button

                      className="small-button"

                      onClick={() =>

                        onShare(pack)

                      }

                      disabled={

                        !pack.published

                      }

                      title={

                        !pack.published

                          ? "Publish the pack before sharing"

                          : "Copy public link"

                      }

                    >

                      Share

                    </button>



                    <button

                      className="small-button danger"

                      onClick={() =>

                        onDelete(

                          pack.id

                        )

                      }

                    >

                      Delete

                    </button>



                  </div>



                </div>



              </div>

            )

          )}



        </div>

      )}



    </div>

  );

}