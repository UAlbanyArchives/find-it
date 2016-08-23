# Find It!

A single-page application to fetch information about archival objects in ArchivesSpace using refids.

## Requirements

Because the application makes HTTP using Javascript, CORS needs to be implemented on your ArchivesSpace instance. You can do this with a plugin. See [as-cors](https://github.com/RockefellerArchiveCenter/as-cors) for an example of how to do this with an ArchivesSpace plugin.

## Installation

1.  Set up a config file, which should be named `app-config.js` and placed in the `js/` directory. It should look something like this:

        var baseUrl = "http://localhost:8089"; // Base url for your ArchivesSpace instance, including the backend port number
        var repoId = "2"; // ID for the repo you want to query against
        var token = "81ee42992541795ad7cee5b5701a632fd43a61831b1768cab88e921e3a983e27"; // Non-expiring session token for an AS user

To get a non-expiring session token, use a `expiring=false` parameter when making an [ArchivesSpace authentication request](http://archivesspace.github.io/archivesspace/api/#authentication).

## Usage

Open up `index.html`, drop a refid for an ArchivesSpace archival object into the search box, click "find" or hit enter, and watch the magic happen!

If `Find It!` has trouble connecting to ArchivesSpace or logging you in, those errors will be displayed in the top right hand corner of the page.

## Contributing

Pull requests accepted!

## Authors

Hillel Arnold

## License

Code is released under an MIT License. See `LICENSE.md` for more information.
