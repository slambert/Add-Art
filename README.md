#Add-Art
Add-Art is a Firefox ([Chrome](https://github.com/coreytegeler/add-art-chrome) & [Safari](https://github.com/owise1/add-art-safari)) Browser Extension that replaces ads with art.

When it works, it works pretty good. We all want it to be better, and we welcome your help with that.


##Links

SITE: [Add-Art.org][6]

WIKI: [https://github.com/slambert/Add-Art/wiki][7] - out of date

LICENSE: [GPL][8]

## Contribute

You can see what else we've been working on in the [issues][9] section.

Do contribute:

 1. Fork the project 
 * Create a branch
 * Commit your changes
 * Push to the branch
 * Comment on the issue (or create an issue) with a link to your branch
 * Sit back and wait

### Development 

#### To install:

First you'll need to [install jpm](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Installation). Then install the npm packages:

```
npm install
```

#### To work on the popup:

```
npm run watch
```
Then open `data/popup.html` in a browser

#### To run extension in the browser:

```
npm run jpm 
```

#### How it currently works

Add-Art v2 no longer depends on Ad Block Plus and makes use of the [Mozilla Addons SDK](https://developer.mozilla.org/en-US/Add-ons/SDK). An "essay" (or exhibition) within add-art is simply a JSON file. [This repo](https://github.com/owise1/addendum-exhibitions) lays out an essay's JSON schema.  

Kadist's [Addendum](http://addendum.kadist.org/) visual essays ship with the extension. The configuration for those essays are kept [here](https://github.com/owise1/addendum-exhibitions). 

Users can also create their own essays on the [add-art site](http://add-art.org/essays/).  They receive a link to the JSON for the essay and can use it to import the show into their extension.


## Contributors

 * [Steve Lambert][10]
 * [Wladimir Palant][11]
 * [Corey Tegeler][12]
 * [Jamie Wilkinson][13]
 * [Matt Katz][14]
 * [Ben Bonfil][15] 
 * [Prizoff][16]
 * [Tobias Leingruber][17]
 * [Ethan Ham][18]
 * [Michael Mandiberg][19]
 * [Jeff Crouse][20]
 * [Sean Salmon][21]
 * [Evan Harper][22]
 * [Michelle Kempner][23]
 * [Dan Phiffer][24]
 * [Mushon Zer-Aviv][25]
 * [Alyssa Wright][26]
 * [Oliver Wise][27]
 
And help from 

* Hana Newman


[1]: http://www.brooklynmuseum.org/
[2]: http://eyebeam.org/
[3]: http://www.kadist.org/
[4]: http://www.nasa.gov/
[5]: http://rhizome.org/
[6]: http://Add-Art.org
[7]: https://github.com/slambert/Add-Art/wiki
[8]: https://www.gnu.org/licenses/gpl.txt
[9]: https://github.com/slambert/Add-Art/issues
[10]: http://visitsteve.com
[11]: http://adblockplus.org/
[12]: http://coreytegeler.com
[13]: http://tramschase.com/
[14]: http://www.morelightmorelight.com/
[15]: http://benbonfil.com
[16]: https://www.freelancer.com/users/2641827.html
[17]: http://www.tobi-x.com/
[18]: http://www.ethanham.com/
[19]: http://www.mandiberg.com/
[20]: http://www.jeffcrouse.info/
[21]: http://www.seanaes.com/
[22]: http://a.parsons.edu/~evan/school/
[23]: https://twitter.com/#!/mikey_k
[24]: http://phiffer.org/
[25]: http://mushon.com/
[26]: http://alumni.media.mit.edu/~alyssa/
[27]: http://owise1.guru

