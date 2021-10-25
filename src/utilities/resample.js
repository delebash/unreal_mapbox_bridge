//
// import module from "./pkg"
//
//   function myresize() {
//     let base64 = fs.readFileSync(`terrain.png`, { encoding: 'base64' });
//     let data = base64.replace(/^data:image\/(png|jpg);base64,/, "");
//
//     // convert base64 to PhotonImage
//     let phtn_img = module.PhotonImage.new_from_base64(data);
//     module.resize(phtn_img,2017,2017,SamplingFilter.Lanczos3)
//
//     //  photon.grayscale(phtn_img);
//
//     // get base64 from filtered image, and write
//     let output_base64 = phtn_img.get_base64();
//     let output_image_name = "output.png";
//     let output_data = output_base64.replace(/^data:image\/\w+;base64,/, '');
//
//     fs.writeFile(output_image_name, output_data, {encoding: 'base64'}, function(err) {
//     });
//   }
//
// myresize()
