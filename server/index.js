
import dns from "dns";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ========================================
// DNS FIX
// ========================================

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

// ========================================
// ENVIRONMENT VARIABLES
// ========================================

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_secret_change_me";

const FREE_SIGNUP_CREDITS = Number(
  process.env.FREE_SIGNUP_CREDITS || 3
);

const MONGODB_URI = process.env.MONGODB_URI;

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// SINGLE ADMIN
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL;

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD;

// ========================================
// ENVIRONMENT CHECK
// ========================================

if (!MONGODB_URI) {
  console.error(
    "❌ MONGODB_URI is missing from .env"
  );

  process.exit(1);
}

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error(
    "❌ EMAIL_USER or EMAIL_PASS is missing from .env"
  );

  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing from .env"
  );

  process.exit(1);
}

// ========================================
// EXPRESS
// ========================================

const app = express();

app.use(cors());

app.use(express.json());

// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    credits: {
      type: Number,
      default: FREE_SIGNUP_CREDITS,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    versionKey: false,
  }
);

////

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Company = mongoose.model("Company", companySchema);


// ======================================================
// PREP PACK MODEL
// ======================================================

// ======================================================
// PREPARATION PACK MODEL
// ======================================================

const roundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: true,
  }
);

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    round: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const materialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      default: "file",
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const packSchema = new mongoose.Schema(
  {
    // COMPANY
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // ROLE
    role: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      slug: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // PACK TITLE
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // URL SLUG
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // HOW TO PREPARE
    preparation: {
      type: String,
      default: "",
      trim: true,
    },

    // INTERVIEW ROUNDS
    rounds: {
      type: [roundSchema],
      default: [],
    },

    // QUESTIONS
    questions: {
      type: [questionSchema],
      default: [],
    },

    // FILES / MATERIALS
    materials: {
      type: [materialSchema],
      default: [],
    },

    // PRICE
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // PUBLISH STATUS
    published: {
      type: Boolean,
      default: false,
    },

    // SALES
    sales: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);


const Pack = mongoose.model("Pack", packSchema);

const User =
  mongoose.model("User", userSchema);

// ========================================
// EMAIL TRANSPORTER
// ========================================

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

// ========================================
// HELPER FUNCTIONS
// ========================================

async function findUserByEmail(email) {
  return User.findOne({
    email: email
      .toLowerCase()
      .trim(),
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    emailVerified:
      user.emailVerified,
    createdAt: user.createdAt,
  };
}

// ========================================
// JWT
// ========================================

function signToken(
  user,
  role = "user"
) {
  return jwt.sign(
    {
      sub: user._id.toString(),

      email: user.email,

      role,
    },

    JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
}

function signAdminToken() {
  return jwt.sign(
    {
      email: ADMIN_EMAIL,

      role: "admin",
    },

    JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
}

// ========================================
// GENERATE OTP
// ========================================

function generateOTP() {
  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();
}

// ========================================
// SEND VERIFICATION EMAIL
// ========================================

async function sendVerificationEmail(
  email,
  otp
) {
  await transporter.sendMail({
    from: `"Prep Vault" <${EMAIL_USER}>`,

    to: email,

    subject:
      "Verify your Prep Vault account",

    html: `
      <!DOCTYPE html>

      <html>

      <head>
        <meta charset="UTF-8" />

        <title>
          Prep Vault Verification
        </title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          font-family: Arial, sans-serif;
        "
      >

        <div
          style="
            max-width: 500px;
            margin: 40px auto;
            background: white;
            padding: 35px;
            border-radius: 12px;
            border: 1px solid #e5e5e5;
          "
        >

          <h2>
            Welcome to Prep Vault 👋
          </h2>

          <p>
            Thanks for creating your
            Prep Vault account.
          </p>

          <p>
            Use the verification code below
            to verify your email address:
          </p>

          <div
            style="
              text-align: center;
              margin: 30px 0;
            "
          >

            <span
              style="
                display: inline-block;
                background: #f1f1f1;
                padding: 18px 25px;
                border-radius: 10px;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
              "
            >
              ${otp}
            </span>

          </div>

          <p>
            This code will expire in
            <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create this account,
            you can safely ignore this email.
          </p>

          <hr
            style="
              border: none;
              border-top: 1px solid #eee;
              margin: 30px 0;
            "
          />

          <p
            style="
              color: #888;
              font-size: 13px;
            "
          >
            Prep Vault
          </p>

        </div>

      </body>

      </html>
    `,
  });
}

// ========================================
// USER AUTH MIDDLEWARE
// ========================================

async function authMiddleware(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization || "";

  const token =
    header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      error: "Missing token",
    });
  }

  try {
    const payload =
      jwt.verify(
        token,
        JWT_SECRET
      );

    // Don't allow admin token
    // to act as normal user
    if (
      payload.role &&
      payload.role !== "user"
    ) {
      return res.status(403).json({
        error:
          "User authentication required",
      });
    }

    const user =
      await User.findById(
        payload.sub
      );

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        error:
          "Please verify your email first",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error:
        "Invalid or expired token",
    });
  }
}

// ========================================
// ADMIN MIDDLEWARE
// ========================================

function adminMiddleware(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization || "";

  const token =
    header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      error:
        "Admin authentication required",
    });
  }

  try {
    const payload =
      jwt.verify(
        token,
        JWT_SECRET
      );

    if (
      payload.role !== "admin" ||
      payload.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {
      return res.status(403).json({
        error:
          "Admin access denied",
      });
    }

    req.admin = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      error:
        "Invalid or expired admin token",
    });
  }
}

// ========================================
// HEALTH CHECK
// ========================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      ok: true,

      database:
        mongoose.connection
          .readyState === 1
          ? "connected"
          : "disconnected",
    });
  }
);

// ========================================
// SIGNUP
// ========================================

app.post(
  "/api/auth/signup",

  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body || {};

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          error:
            "Name, email and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error:
            "Password must be at least 6 characters",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const existingUser =
        await findUserByEmail(
          normalizedEmail
        );

      // Existing user
      if (existingUser) {
        // Already verified
        if (
          existingUser.emailVerified
        ) {
          return res.status(409).json({
            error:
              "An account with this email already exists",
          });
        }

        // Existing but not verified
        const otp =
          generateOTP();

        existingUser.emailVerificationOTP =
          await bcrypt.hash(
            otp,
            10
          );

        existingUser.emailVerificationExpires =
          new Date(
            Date.now() +
              10 * 60 * 1000
          );

        await existingUser.save();

        await sendVerificationEmail(
          existingUser.email,
          otp
        );

        return res.status(200).json({
          message:
            "Verification OTP sent to your email",

          email:
            existingUser.email,
        });
      }

      // Hash password
      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      // Generate OTP
      const otp =
        generateOTP();

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );

      // Create user
      const user =
        await User.create({
          name:
            name.trim(),

          email:
            normalizedEmail,

          passwordHash,

          credits:
            FREE_SIGNUP_CREDITS,

          emailVerified:
            false,

          emailVerificationOTP:
            otpHash,

          emailVerificationExpires:
            new Date(
              Date.now() +
                10 * 60 * 1000
            ),
        });

      // Send OTP
      await sendVerificationEmail(
        user.email,
        otp
      );

      return res.status(201).json({
        message:
          "Verification OTP sent to your email",

        email:
          user.email,
      });
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          error:
            "An account with this email already exists",
        });
      }

      return res.status(500).json({
        error:
          "Could not create account",
      });
    }
  }
);

// ========================================
// VERIFY EMAIL
// ========================================

app.post(
  "/api/auth/verify-email",

  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body || {};

      if (!email || !otp) {
        return res.status(400).json({
          error:
            "Email and OTP are required",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const user =
        await findUserByEmail(
          normalizedEmail
        );

      if (!user) {
        return res.status(404).json({
          error:
            "User not found",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          error:
            "Email is already verified",
        });
      }

      if (
        !user.emailVerificationOTP
      ) {
        return res.status(400).json({
          error:
            "No verification OTP found. Please request a new one.",
        });
      }

      if (
        !user.emailVerificationExpires ||
        user.emailVerificationExpires <
          new Date()
      ) {
        return res.status(400).json({
          error:
            "OTP has expired. Please request a new OTP.",
        });
      }

      const otpCorrect =
        await bcrypt.compare(
          otp.toString(),
          user.emailVerificationOTP
        );

      if (!otpCorrect) {
        return res.status(400).json({
          error:
            "Invalid OTP",
        });
      }

      user.emailVerified =
        true;

      user.emailVerificationOTP =
        undefined;

      user.emailVerificationExpires =
        undefined;

      await user.save();

      const token =
        signToken(
          user,
          "user"
        );

      return res.json({
        message:
          "Email verified successfully",

        token,

        role: "user",

        user:
          toPublicUser(user),
      });
    } catch (error) {
      console.error(
        "Email verification error:",
        error
      );

      return res.status(500).json({
        error:
          "Email verification failed",
      });
    }
  }
);

// ========================================
// RESEND OTP
// ========================================

app.post(
  "/api/auth/resend-otp",

  async (req, res) => {
    try {
      const {
        email,
      } = req.body || {};

      if (!email) {
        return res.status(400).json({
          error:
            "Email is required",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      const user =
        await findUserByEmail(
          normalizedEmail
        );

      if (!user) {
        return res.status(404).json({
          error:
            "User not found",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          error:
            "Email is already verified",
        });
      }

      const otp =
        generateOTP();

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );

      user.emailVerificationOTP =
        otpHash;

      user.emailVerificationExpires =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await user.save();

      await sendVerificationEmail(
        user.email,
        otp
      );

      return res.json({
        message:
          "A new verification OTP has been sent",
      });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      return res.status(500).json({
        error:
          "Could not resend OTP",
      });
    }
  }
);

// ========================================
// LOGIN
// ========================================

app.post(
  "/api/auth/login",

  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          error:
            "Email and password are required",
        });
      }

      const normalizedEmail =
        email
          .toLowerCase()
          .trim();

      // ======================================
      // ADMIN LOGIN
      // ======================================

      if (
        normalizedEmail ===
          ADMIN_EMAIL.toLowerCase() &&
        password ===
          ADMIN_PASSWORD
      ) {
        const token =
          signAdminToken();

        return res.json({
          token,

          role: "admin",

          admin: {
            email:
              ADMIN_EMAIL,
          },
        });
      }

      // ======================================
      // NORMAL USER LOGIN
      // ======================================

      const user =
        await findUserByEmail(
          normalizedEmail
        );

      if (!user) {
        return res.status(401).json({
          error:
            "Invalid email or password",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          error:
            "Please verify your email before logging in",

          email:
            user.email,
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.passwordHash
        );

      if (!passwordMatch) {
        return res.status(401).json({
          error:
            "Invalid email or password",
        });
      }

      const token =
        signToken(
          user,
          "user"
        );

      return res.json({
        token,

        role: "user",

        user:
          toPublicUser(user),
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

// ========================================
// GET CURRENT USER
// ========================================

app.get(
  "/api/auth/me",

  authMiddleware,

  (req, res) => {
    return res.json({
      user:
        toPublicUser(
          req.user
        ),
    });
  }
);

// ========================================
// ADMIN TEST
// ========================================

app.get(
  "/api/admin/test",

  adminMiddleware,

  (req, res) => {
    return res.json({
      success: true,

      message:
        "Admin authentication working",

      admin:
        req.admin.email,
    });
  }
);

// ======================================================
// ADMIN - COMPANIES
// ======================================================

// GET ALL COMPANIES
app.get("/api/admin/companies", adminMiddleware, async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      companies.map(async (company) => {
        const packCount = await Pack.countDocuments({
          company: company._id,
        });

        return {
          id: company._id,
          name: company.name,
          slug: company.slug,
          description: company.description,
          packs: packCount,
          status: "Active",
        };
      })
    );

    res.json({
      companies: result,
    });
  } catch (error) {
    console.error("Get companies error:", error);

    res.status(500).json({
      error: "Failed to load companies",
    });
  }
});

app.get("/api/companies", async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      companies.map(async (company) => {
        const packCount = await Pack.countDocuments({
          company: company._id,
          published: true,
        });

        return {
          id: company._id,
          name: company.name,
          slug: company.slug,
          description: company.description,
          packCount,
        };
      })
    );

    res.json({
      companies: result,
    });
  } catch (error) {
    console.error("Fetch public companies error:", error);

    res.status(500).json({
      error: "Failed to fetch companies",
    });
  }
});


// CREATE COMPANY
app.post("/api/admin/companies", adminMiddleware, async (req, res) => {
  console.log("🔥 COMPANY BODY RECEIVED:", req.body);
  try {
    const { name, description = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Company name is required",
      });
    }

    const cleanName = name.trim();

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await Company.findOne({
      $or: [
        { name: cleanName },
        { slug },
      ],
    });

    if (existing) {
      return res.status(409).json({
        error: "Company already exists",
      });
    }

    const company = await Company.create({
      name: cleanName,
      slug,
      description: description.trim(),
    });

    res.status(201).json({
      message: "Company created successfully",
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        packs: 0,
        status: "Active",
      },
    });
  } catch (error) {
    console.error("Create company error:", error);

    res.status(500).json({
      error: "Failed to create company",
    });
  }
});


// DELETE COMPANY
app.delete(
  "/api/admin/companies/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      const company = await Company.findById(req.params.id);

      if (!company) {
        return res.status(404).json({
          error: "Company not found",
        });
      }

      // Delete all packs belonging to company
      await Pack.deleteMany({
        company: company._id,
      });

      await Company.findByIdAndDelete(company._id);

      res.json({
        message: "Company and its packs deleted successfully",
      });
    } catch (error) {
      console.error("Delete company error:", error);

      res.status(500).json({
        error: "Failed to delete company",
      });
    }
  }
);



// GET ALL PACKS FOR ADMIN
// ======================================================
// PREPARATION PACK HELPERS
// ======================================================

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// ======================================================
// CLEAN ROUNDS
// ======================================================

function cleanRounds(rounds) {
  if (!Array.isArray(rounds)) {
    return [];
  }

  return rounds
    .map((round, index) => ({
      name: String(round?.name || "").trim(),

      description: String(
        round?.description || ""
      ).trim(),

      order:
        Number(round?.order) ||
        index + 1,
    }))
    .filter((round) => round.name);
}


// ======================================================
// CLEAN QUESTIONS
// ======================================================

function cleanQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .map((item) => ({
      question: String(
        item?.question || ""
      ).trim(),

      category: String(
        item?.category || ""
      ).trim(),

      round: String(
        item?.round || ""
      ).trim(),
    }))
    .filter((item) => item.question);
}


// ======================================================
// CLEAN MATERIALS
// ======================================================

function cleanMaterials(materials) {
  if (!Array.isArray(materials)) {
    return [];
  }

  return materials
    .map((item) => ({
      name: String(
        item?.name || ""
      ).trim(),

      type: String(
        item?.type || "file"
      ).trim(),

      url: String(
        item?.url || ""
      ).trim(),
    }))
    .filter(
      (item) =>
        item.name &&
        item.url
    );
}


// ======================================================
// FORMAT ADMIN PACK
// ======================================================

function formatAdminPack(pack) {
  return {
    id: pack._id,

    company:
      pack.company?.name ||
      "Unknown",

    companyId:
      pack.company?._id,

    companySlug:
      pack.company?.slug ||
      "",

    role:
      pack.role?.name ||
      "General",

    roleSlug:
      pack.role?.slug ||
      "",

    title: pack.title,

    slug: pack.slug,

    preparation:
      pack.preparation ||
      "",

    rounds:
      pack.rounds ||
      [],

    questions:
      pack.questions ||
      [],

    materials:
      pack.materials ||
      [],

    price: pack.price,

    published:
      pack.published,

    sales:
      pack.sales || 0,

    roundCount:
      pack.rounds?.length ||
      0,

    questionCount:
      pack.questions?.length ||
      0,

    materialCount:
      pack.materials?.length ||
      0,

    createdAt:
      pack.createdAt,

    updatedAt:
      pack.updatedAt,
  };
}


// ======================================================
// ADMIN - GET ALL PACKS
// ======================================================

app.get(
  "/api/admin/packs",
  adminMiddleware,
  async (req, res) => {
    try {
      const packs =
        await Pack.find()
          .populate(
            "company",
            "name slug"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      res.json({
        packs:
          packs.map(
            formatAdminPack
          ),
      });
    } catch (error) {
      console.error(
        "Get packs error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to load preparation packs",
      });
    }
  }
);


// ======================================================
// ADMIN - CREATE PACK
// ======================================================

app.post(
  "/api/admin/packs",
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        companyId,
        role,
        title,
        preparation = "",
        rounds = [],
        questions = [],
        materials = [],
        price,
      } = req.body || {};


      // COMPANY
      if (!companyId) {
        return res.status(400).json({
          error:
            "Company is required",
        });
      }


      // ROLE
      if (
        !role ||
        !String(role).trim()
      ) {
        return res.status(400).json({
          error:
            "Role is required",
        });
      }


      // TITLE
      if (
        !title ||
        !String(title).trim()
      ) {
        return res.status(400).json({
          error:
            "Pack title is required",
        });
      }


      // FIND COMPANY
      const company =
        await Company.findById(
          companyId
        );

      if (!company) {
        return res.status(404).json({
          error:
            "Company not found",
        });
      }


      const cleanRole =
        String(role).trim();

      const cleanTitle =
        String(title).trim();


      // PRICE
      const numericPrice =
        Number(price);

      if (
        Number.isNaN(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          error:
            "Price must be a valid non-negative number",
        });
      }


      // SLUG
      const slugBase =
        slugify(
          `${company.name}-${cleanRole}-${cleanTitle}`
        ) ||
        slugify(cleanTitle);


      let slug = slugBase;

      let counter = 2;

      while (
        await Pack.exists({
          slug,
        })
      ) {
        slug =
          `${slugBase}-${counter}`;

        counter++;
      }


      // CREATE
      const pack =
        await Pack.create({
          company:
            company._id,

          role: {
            name:
              cleanRole,

            slug:
              slugify(
                cleanRole
              ),
          },

          title:
            cleanTitle,

          slug,

          preparation:
            String(
              preparation || ""
            ).trim(),

          rounds:
            cleanRounds(
              rounds
            ),

          questions:
            cleanQuestions(
              questions
            ),

          materials:
            cleanMaterials(
              materials
            ),

          price:
            numericPrice,

          published:
            false,

          sales:
            0,
        });


      // POPULATE
      const populatedPack =
        await Pack.findById(
          pack._id
        )
          .populate(
            "company",
            "name slug"
          )
          .lean();


      res.status(201).json({
        message:
          "Preparation pack created successfully",

        pack:
          formatAdminPack(
            populatedPack
          ),
      });

    } catch (error) {

      console.error(
        "Create pack error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to create preparation pack",
      });
    }
  }
);


// ======================================================
// ADMIN - UPDATE PACK
// ======================================================

app.put(
  "/api/admin/packs/:id",
  adminMiddleware,
  async (req, res) => {
    try {

      const pack =
        await Pack.findById(
          req.params.id
        );


      if (!pack) {
        return res.status(404).json({
          error:
            "Pack not found",
        });
      }


      const {
        companyId,
        role,
        title,
        preparation,
        rounds,
        questions,
        materials,
        price,
      } = req.body || {};


      // COMPANY
      if (
        companyId !==
        undefined
      ) {

        const company =
          await Company.findById(
            companyId
          );

        if (!company) {
          return res.status(404).json({
            error:
              "Company not found",
          });
        }

        pack.company =
          company._id;
      }


      // ROLE
      if (
        role !==
        undefined
      ) {

        if (
          !String(role).trim()
        ) {
          return res.status(400).json({
            error:
              "Role is required",
          });
        }

        pack.role = {
          name:
            String(role).trim(),

          slug:
            slugify(role),
        };
      }


      // TITLE
      if (
        title !==
        undefined
      ) {

        if (
          !String(title).trim()
        ) {
          return res.status(400).json({
            error:
              "Pack title is required",
          });
        }

        pack.title =
          String(title).trim();
      }


      // PREPARATION
      if (
        preparation !==
        undefined
      ) {

        pack.preparation =
          String(
            preparation || ""
          ).trim();
      }


      // ROUNDS
      if (
        rounds !==
        undefined
      ) {

        pack.rounds =
          cleanRounds(
            rounds
          );
      }


      // QUESTIONS
      if (
        questions !==
        undefined
      ) {

        pack.questions =
          cleanQuestions(
            questions
          );
      }


      // MATERIALS
      if (
        materials !==
        undefined
      ) {

        pack.materials =
          cleanMaterials(
            materials
          );
      }


      // PRICE
      if (
        price !==
        undefined
      ) {

        const numericPrice =
          Number(price);

        if (
          Number.isNaN(
            numericPrice
          ) ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            error:
              "Price must be a valid non-negative number",
          });
        }

        pack.price =
          numericPrice;
      }


      // COMPANY FOR SLUG
      const company =
        await Company.findById(
          pack.company
        );

      if (!company) {
        return res.status(404).json({
          error:
            "Company not found",
        });
      }


      // REBUILD SLUG
      const slugBase =
        slugify(
          `${company.name}-${pack.role.name}-${pack.title}`
        );


      let slug =
        slugBase;

      let counter = 2;


      while (
        await Pack.exists({
          slug,

          _id: {
            $ne:
              pack._id,
          },
        })
      ) {

        slug =
          `${slugBase}-${counter}`;

        counter++;
      }


      pack.slug =
        slug;


      await pack.save();


      const populatedPack =
        await Pack.findById(
          pack._id
        )
          .populate(
            "company",
            "name slug"
          )
          .lean();


      res.json({
        message:
          "Preparation pack updated successfully",

        pack:
          formatAdminPack(
            populatedPack
          ),
      });

    } catch (error) {

      console.error(
        "Update pack error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to update preparation pack",
      });
    }
  }
);


// ======================================================
// ADMIN - DELETE PACK
// ======================================================

app.delete(
  "/api/admin/packs/:id",
  adminMiddleware,
  async (req, res) => {

    try {

      const pack =
        await Pack.findById(
          req.params.id
        );


      if (!pack) {
        return res.status(404).json({
          error:
            "Pack not found",
        });
      }


      await Pack.findByIdAndDelete(
        pack._id
      );


      res.json({
        message:
          "Preparation pack deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete pack error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to delete preparation pack",
      });
    }
  }
);


// ======================================================
// ADMIN - PUBLISH / UNPUBLISH
// ======================================================

app.patch(
  "/api/admin/packs/:id/publish",
  adminMiddleware,
  async (req, res) => {

    try {

      const pack =
        await Pack.findById(
          req.params.id
        );


      if (!pack) {
        return res.status(404).json({
          error:
            "Pack not found",
        });
      }


      pack.published =
        !pack.published;


      await pack.save();


      res.json({
        message:
          pack.published
            ? "Pack published successfully"
            : "Pack unpublished successfully",

        published:
          pack.published,
      });

    } catch (error) {

      console.error(
        "Publish pack error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to update pack",
      });
    }
  }
);


// ======================================================
// PUBLIC - GET PUBLISHED PACKS
// ======================================================

app.get(
  "/api/packs",
  async (req, res) => {

    try {

      const packs =
        await Pack.find({
          published:
            true,
        })
          .populate(
            "company",
            "name slug"
          )
          .sort({
            createdAt: -1,
          })
          .lean();


      const result =
        packs.map(
          (pack) => ({
            id:
              pack._id,

            company:
              pack.company?.name ||
              "",

            companySlug:
              pack.company?.slug ||
              "",

            role:
              pack.role?.name ||
              "General",

            roleSlug:
              pack.role?.slug ||
              "",

            title:
              pack.title,

            slug:
              pack.slug,

            preparation:
              pack.preparation ||
              "",

            rounds:
              pack.rounds ||
              [],

            price:
              pack.price,

            roundCount:
              pack.rounds
                ?.length ||
              0,

            questionCount:
              pack.questions
                ?.length ||
              0,

            materialCount:
              pack.materials
                ?.length ||
              0,

            published:
              pack.published,

            createdAt:
              pack.createdAt,
          })
        );


      res.json({
        packs:
          result,
      });

    } catch (error) {

      console.error(
        "Get public packs error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to load preparation packs",
      });
    }
  }
);


// ======================================================
// PUBLIC - GET SINGLE PACK
// ======================================================

app.get(
  "/api/packs/:slug",
  async (req, res) => {

    try {

      const pack =
        await Pack.findOne({
          slug:
            req.params.slug,

          published:
            true,
        })
          .populate(
            "company",
            "name slug"
          )
          .lean();


      if (!pack) {
        return res.status(404).json({
          error:
            "Preparation pack not found",
        });
      }


      res.json({
        pack: {

          id:
            pack._id,

          company:
            pack.company?.name ||
            "",

          companySlug:
            pack.company?.slug ||
            "",

          role:
            pack.role?.name ||
            "General",

          roleSlug:
            pack.role?.slug ||
            "",

          title:
            pack.title,

          slug:
            pack.slug,

          preparation:
            pack.preparation ||
            "",

          rounds:
            pack.rounds ||
            [],

          questions:
            pack.questions ||
            [],

          materials:
            pack.materials ||
            [],

          price:
            pack.price,

          published:
            pack.published,

          sales:
            pack.sales ||
            0,

          createdAt:
            pack.createdAt,
        },
      });

    } catch (error) {

      console.error(
        "Get public pack detail error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to load preparation pack",
      });
    }
  }
);

// ========================================
// ADMIN INFO
// ========================================

app.get(
  "/api/admin/me",

  adminMiddleware,

  (req, res) => {
    return res.json({
      admin: {
        email:
          req.admin.email,

        role:
          req.admin.role,
      },
    });
  }
);

// ========================================
// START SERVER
// ========================================

async function startServer() {
  try {
    console.log(
      "Connecting to MongoDB Atlas..."
    );

    await mongoose.connect(
      MONGODB_URI
    );

    console.log(
      "✅ MongoDB Atlas connected successfully"
    );

    app.listen(
      PORT,

      () => {
        console.log(
          `🚀 Prep Vault API running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    process.exit(1);
  }
}

startServer();