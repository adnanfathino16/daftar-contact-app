const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/tes", { useNewUrlParser: true, useUnifiedTopology: true });

// ----(membuktikan bahwa sudah terkoneksi ke mongodb dengan memasukkan data)---------
// // Menambah 1 data
// const contact1 = new Contact({
//   nama: "Selfia Nuraga",
//   nohp: "085883956177",
//   email: "nuragaselfia@gmail.com",
// });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact));
