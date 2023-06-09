// deklarasi express
const express = require("express");
// deklarasi express layouts
const expressLayouts = require("express-ejs-layouts");

// express-validator npm
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// koneksi db
require("./utils/db");
// data contact.js
const Contact = require("./model/contact");

// panggil express
const app = express();
const port = 3000;

// setup method override
app.use(methodOverride("_method"));

/// gunakan ejs
app.set("view engine", "ejs");

// Third-party middleware
app.use(expressLayouts);

// Built-in middleware
app.use(express.static("public"));
// extended true untuk menghilangkan alert desprecated yang ada pada CLI
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// halaman home
app.get("/", (req, res) => {
  // data mahasiswa
  const mahasiswa = [
    {
      nama: "Adnan Fathino",
      email: "fathinoadnan@gmail.com",
    },
    {
      nama: "Selfia Nuraga Chaniago",
      email: "nuragaselfia@gmail.com",
    },
    {
      nama: "Linonel Messi",
      email: "messi@gmail.com",
    },
  ];
  // memanggil view engine dengan nama filenya dan relative dengan folder views
  res.render("index", {
    nama: "Adnan Fathino",
    title: "Halaman Home",
    mahasiswa: mahasiswa,
    layout: "layouts/main-layout",
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

// halaman contact
app.get("/contact", async (req, res) => {
  //   Contact.find().then((contact) => {
  //     res.send(contact);
  //   });
  const contacts = await Contact.find();

  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout",
    contacts: contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah data contact harus ditaruh sebelum routes detail
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layouts/main-layout",
  });
});

// proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah tersedia!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash("msg", "Data Contact Berhasil ditambahkan!");

        // balik ke halaman contact
        // jika redirect seperti ini bukan method post tetapi get
        res.redirect("/contact");
      });
    }
  }
);

// // jangan menaruh routes ini setelah routes halama detail karena masih method get bukan delete nanti bisa yang dikerjakan halaman detail dulu
// // proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   // cek di contact.json apakah ada atau tidak
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       req.flash("msg", "Data Contact Berhasil dihapus!");
//       // balik ke halaman contact
//       // jika redirect seperti ini bukan method post tetapi get
//       res.redirect("/contact");
//     });
//   }
// });
app.delete("/contact", (req, res) => {
  // res.send(req.body);
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data Contact Berhasil dihapus!");
    // balik ke halaman contact
    // jika redirect seperti ini bukan method post tetapi get
    res.redirect("/contact");
  });
});

// halaman form ubah data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// proses ubah data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah tersedia!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No HP tidak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.emal,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data Contact Berhasil diubah!");
        // balik ke halaman contact
        // jika redirect seperti ini bukan method post tetapi get
        res.redirect("/contact");
      });
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  //   const contact = findContact(req.params.nama); //ini yang dulu
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main-layout",
    contact: contact,
  });
});

app.listen(port, () => {
  console.log(`mongo contact app | listening at http://localhost:${port}`);
});
