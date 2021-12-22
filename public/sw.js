// Set this to true for production
var doCache = false;

// Name our cache
var CACHE_NAME = "my-pwa-cache-v1";

// Delete old caches that are not our current one!
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            console.log("Deleting cache: " + key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// The first time the user starts up the PWA, 'install' is triggered.
self.addEventListener("install", function (event) {
  if (doCache) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        // Get the assets manifest so we can see what our js file is named
        // This is because webpack hashes it
        fetch("asset-manifest.json")
          .then((response) => {
            response.json();
          })
          .then((assets) => {
            // Open a cache and cache our files
            // We want to cache the page and the main.js generated by webpack
            // We could also cache any static assets like CSS or images
            const urlsToCache = ["/", assets["main.js"]];
            cache.addAll(urlsToCache);
            console.log("cached");
          });
      })
    );
  }
});

// When the webpage goes to fetch files, we intercept that request and serve up the matching files
// if we have them
self.addEventListener("fetch", function (event) {
  if (doCache) {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  }
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // If this is an incoming POST request for the
  // registered "action" URL, respond to it.
  if (event.request.method === "POST" && url.pathname === "/pwaa") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        alert(formData);
        const link = formData.getAll("file") || "";
        alert(link);
        // const responseUrl = await saveBookmark(link);
        return Response.redirect("/", 303);
      })()
    );
  }
});

//   onChange={(event) => {
//     const file = event.target.files[0];
//     const data = new FormData();
//     data.append("file", file);
//     setIsUploading(true);
//     axios
//       .post("https://wa-chat-analyzer.herokuapp.com/wrap", data, {
//         // receive two parameter endpoint url ,form data
//       })
//       .then((res) => {
//         setData(res.data);
//         setShowRes(true);
//       });
//   }}
