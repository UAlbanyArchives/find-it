# Find It!

A single-page application to fetch information about archival objects in ArchivesSpace using refids.

## Requirements

Because the application makes HTTP using Javascript, CORS needs to be implemented on your ArchivesSpace instance. See [as-cors](https://github.com/RockefellerArchiveCenter/as-cors) for an example of how to do this with an ArchivesSpace plugin.

## Installation

1.  Set up a config file, which should be named `app-config.js` and placed in the `js/` directory. It should look something like this:

        var baseUrl = "http://localhost:8089"; // Base url for your ArchivesSpace instance, including the backend port number
        var repoId = "2"; // ID for the repo you want to query against
        var token = "81ee42992541795ad7cee5b5701a632fd43a61831b1768cab88e921e3a983e27"; // Non-expiring session token for an AS user

To get a non-expiring session token, use a `expiring=false` parameter when making an [ArchivesSpace authentication request](http://archivesspace.github.io/archivesspace/api/#authentication).

Optionally, you can add two variables corresponding to refids that have been replaced as well as the new values. These lists (which should be JSON arrays) must be in the same order. This is useful if you have recently replaced refids in ArchivesSpace and outdated values persist in other data sources. In the example below, if you searched for a component with a refid of `456`, Find It! would perform a secondary search for a components with a refid of `second`:

        var replacedIds = ["123", "456", "789"] // an array of refids that used to exist in the system but have have been replaced
        var replacedWithIds = ["first", "second", "third"] // an array of refids that replaced the other refids.

## Usage

Open up `index.html`, drop a refid for an ArchivesSpace archival object or the full DIMES url for the object you'd like into the search box, click "find" or hit enter, and watch the magic happen!

If `Find It!` has trouble connecting to ArchivesSpace or logging you in, those errors will be displayed in the top right hand corner of the page.

## Contributing

Pull requests accepted!

## Authors

Hillel Arnold

Patrick Galligan

## License

Code is released under an MIT License. See `LICENSE.md` for more information.
