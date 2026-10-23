// CloudFront viewer-request function. Paths whose last segment has no file
// extension are app routes (e.g. /openings/italian-game): serve the SPA shell.
function handler(event) {
  var request = event.request;
  var last = request.uri.split("/").pop();
  if (last.indexOf(".") === -1) {
    request.uri = "/index.html";
  }
  return request;
}
