class itemType {
  constructor(repoType, repoTitle, repoTabTitle, zenodoType, zenodoSubType){
    this._repoType = repoType;
    this._repoTitle = repoTitle;
    this._repoTabTitle = repoTabTitle;
    this._zenodoType = zenodoType;
    this._zenodoSubType = zenodoSubType;
  }
  get repoType(){
    return this._repoType;
  }
  get repoTitle(){
    return this._repoTitle;
  }
  get repoTabTitle(){
    return this._repoTabTitle;
  }
  get zenodoType(){
    return this._zenodoType;
  }
  get zenodoSubType(){
    return this._zenodoSubType;
  }
}

const arrOfTypes2 = [
  new itemType('report','Open Reports','Reports','publication','report'),
  new itemType('article','Journal articles','Articles',
    ['publication','publication'],
    ['article','conferencepaper']),
  new itemType('presentation','Presentations','Presentations','presentation','')
];

const arrOfTypes = ['report', 'article', 'presentation'];
/*
To store a local copy of the zenodo API response, set up a CRON job. For example:
/usr/bin/curl -o /home/<username>/public_html/repository/repodata.json https://zenodo.org/api/records/?communities=<community name>
*/
const localRepo = true;
let repoPath;
if (localRepo === true){
  repoPath = "/repository/repodata.json";
} else {
  const baseURL = 'https://zenodo.org/api/records/';
  const queryParams = '?communities=';
  const repoName = "morebrains_cooperative";
  repoPath = baseURL+queryParams+repoName;
}
/*
Thumbnails for reports should be 311x220 pixels. Name them the second half of the zenodo DOI eg zenodo.3907486.png imgLocation is set up to look in the wordpress image folder. WP must be set NOT to separate images into folders by month.
*/
const imgLocation = "../wp-content/uploads/";
/*
Special function to allow resizing of a parent iframe. Comment this out for  standalone web pages or if the repo is inserted using <div id="repoInsert"></div>
Put sendPostMessage() in the code after the page is built and every time you change tabs. It also requires the repoInclude.js script to called from the parent document. repoInclude.js contains an event handler that resizes the iframe based on the message that this function sends back.
*/
/*
let height;
const sendPostMessage = () => {
  // This function passes the height of the current doc back to the iframe object in the parent DOM
  // This is only needed when the code is used as part of an iframe
  if (height !== document.getElementById('content').offsetHeight) {
    height = document.getElementById('content').offsetHeight;
    window.parent.postMessage({
      frameHeight: height
    }, '*');
    console.log(height);
  }
};
*/

/////////////////////////////
// Building the repository//
///////////////////////////

const changeColourTabs = (alpha, elem) => {
  const currBGColor = getComputedStyle(elem)["background-color"];
  const colorArr = currBGColor.split("(")[1].split(")")[0].split(",");
  colorArr[3] = alpha;
  const newBGColor = "rgba("+colorArr.join(",")+")";
  document.getElementById(elem.id).style.backgroundColor = newBGColor;
};

const swtichView = (whichTab) => {
  let allTabElems = document.getElementsByClassName("tabs");
  allTabElems = Array.from(allTabElems); // convert HTML collection to array
  allTabElems.map(changeColourTabs.bind(null, " 0.2"));

  const currTabElem = document.getElementById(whichTab+"Tab");
  changeColourTabs(" 1", currTabElem);
  const currBGColor = getComputedStyle(currTabElem)["background-color"];
  document.getElementById("tabLine").style.backgroundColor = currBGColor;

  //Turn off all sections for every type
  arrOfTypes.map(itemType => {
    document.getElementById(itemType+"Section").style.display = "none";
    document.getElementById(itemType+"Tab").style.color = "black";
  });

  // Turn on the one section for the type we want
  document.getElementById(whichTab+"Section").style.display = "block";
  if (whichTab == "article"){
    document.getElementById(whichTab+"Tab").style.color = "rgb(214,245,245)";
  }
};

function buildTabs (type) {
  const tabsRowElem = this.tabsRowElem;
  const tabElem = document.createElement("div");
  tabElem.appendChild(document.createTextNode(type.repoTabTitle));
  tabElem.id = type.repoType+"Tab";
  tabElem.className = "tabs";
  tabElem.onclick = () => swtichView(type.repoType);
  tabsRowElem.appendChild(tabElem);
}

const buildEachType = () => {

};

const buildStructure = () => {

  const topElem = document.getElementById("repoInsert");
  const loadingScreenElem = document.createElement("div");
  loadingScreenElem.id = "loadingScreen";
  topElem.appendChild(loadingScreenElem);

  const loadingTextElem = document.createElement("h1");
  loadingTextElem.appendChild(document.createTextNode("Waiting for respository metadata..."));
  const loaderElem = document.createElement("div");
  loaderElem.className = "loader";
  loadingScreenElem.appendChild(loadingTextElem);
  loadingScreenElem.appendChild(loaderElem);

  const repoElem = document.createElement("div");
  repoElem.id = "repo";
  topElem.appendChild(repoElem);

  const tabsRowElem = document.createElement("div");
  tabsRowElem.id = "tabsRow";
  repoElem.appendChild(tabsRowElem);

  const tabLineElem = document.createElement("div");
  tabLineElem.id = "tabLine";
  tabsRowElem.appendChild(tabLineElem);

  arrOfTypes2.map(buildTabs, {
    tabsRowElem: tabsRowElem
  });

  // The items are broken into three containers
  // reportSection
  // articleSection
  // presentationSection

  const reportSectionElem = document.createElement("div");
  reportSectionElem.id = "reportSection";
  reportSectionElem.className = "repoSection";
  reportSectionElem.style.display = "block";
  repoElem.appendChild(reportSectionElem);

  const reportTextElem = document.createElement("h1");
  const reportTextNode = document.createTextNode("Open reports");
  reportTextElem.appendChild(reportTextNode);
  reportSectionElem.appendChild(reportTextElem);

  const reportContainerElem = document.createElement("div");
  reportContainerElem.id = "reportContainer";
  reportContainerElem.className = "itemContainer";
  reportSectionElem.appendChild(reportContainerElem);

  //////////

  const articleSectionElem = document.createElement("div");
  articleSectionElem.id = "articleSection";
  articleSectionElem.className = "repoSection";
  articleSectionElem.style.display = "none";
  repoElem.appendChild(articleSectionElem);

  const articleTextElem = document.createElement("h1");
  const articleTextNode = document.createTextNode("Journal articles");
  articleTextElem.appendChild(articleTextNode);
  articleSectionElem.appendChild(articleTextElem);

  const articleContainerElem = document.createElement("div");
  articleContainerElem.id = "articleContainer";
  articleContainerElem.className = "itemContainer";
  articleSectionElem.appendChild(articleContainerElem);

  //////////

  const presentationSectionElem = document.createElement("div");
  presentationSectionElem.id = "presentationSection";
  presentationSectionElem.className = "repoSection";
  presentationSectionElem.style.display = "none";
  repoElem.appendChild(presentationSectionElem);

  const presentationTextElem = document.createElement("h1");
  const presentationTextNode = document.createTextNode("Presentations");
  presentationTextElem.appendChild(presentationTextNode);
  presentationSectionElem.appendChild(presentationTextElem);

  const presentationContainerElem = document.createElement("div");
  presentationContainerElem.id = "presentationContainer";
  presentationContainerElem.className = "itemContainer";
  presentationSectionElem.appendChild(presentationContainerElem);

}
///////////////////////////////
// Populating the repository//
/////////////////////////////
const nameTag = (creator) => {
  // Takes each individual author name, changes from 'last, first' to 'first last'
  // Also adds a link to their ORCID record if it exists in the zenodo record
  const newName = creator.name.split(",").reverse().join(" ");
  if (typeof (creator.orcid) != "undefined") {
    const orcidURL = "https://orcid.org/" + creator.orcid;
    const nameWithLink = '<a href="' + orcidURL + '" target="_blank">' + newName + '</a>';
    return (nameWithLink);
  }
  return (newName);
}
const stitchJnlYear = (metadata) => {
  // writes the year of publicaiton after the journal name for articles
  let finalString = "Published";
  if ("journal" in metadata){
    const journal = metadata.journal;
    if ("title" in journal){
      finalString = journal.title;
    } else {
      console.log("Warning: no journal title for " + metadata.title);
    } 
  } else {
    console.log("Warning: No journal record for " + metadata.title);
  }
  if ("publication_date" in metadata){
    const year = metadata.publication_date.split("-")[0];
    finalString = finalString + " (" + year + ")";
  }
  return finalString;
};

const changeItemData = (itemData, ID) => {
  // get the IDs for the compenents that will be updated
  const elem = document.getElementById(ID);
  const imgDIV = elem.getElementsByClassName("thumbBox")[0];
  const titleDIV = elem.getElementsByClassName("itemTitle")[0];
  const jnlTitleDIV = elem.getElementsByClassName("itemJnlTitle")[0];
  const authorDIV = elem.getElementsByClassName("itemAuthors")[0];
  const doiDIV = elem.getElementsByClassName("itemDOI")[0];
  // Authors are in the Zendodo data structure as an array of objects
  // break the names out and join them as a single string
  const imgFileName = itemData.doi.split("/")[1];
  const backupFileName = "/repository/img/MoreBrains_Document_icon.svg";
  // HTML inserts for each part of the item
  const linkedIMG = '<a href="' + itemData.links.html + '" target="_blank">'
    + '<img src="' + imgLocation + imgFileName + '.png"'
    + 'onerror="this.src = &quot;' + backupFileName + '&quot;"> </a>';
  const linkedTitle = '<a href="' + itemData.links.html + '" target="_blank">' + itemData.metadata.title + '</a>';
  const linkedAuthors = itemData.metadata.creators.map(nameTag).join(", ");
  const linkedDOI = '<a href="' + itemData.links.doi + '" target="_blank">DOI: ' + itemData.doi + '</a>';
  // Replace content with real article data
  if (typeof (imgDIV) != "undefined") { imgDIV.innerHTML = linkedIMG }
  if (typeof (titleDIV) != "undefined") { titleDIV.innerHTML = linkedTitle }
  if (typeof (jnlTitleDIV) != "undefined") { jnlTitleDIV.innerHTML = stitchJnlYear(itemData.metadata) }
  if (typeof (authorDIV) != "undefined") { authorDIV.innerHTML = linkedAuthors }
  if (typeof (doiDIV) != "undefined") { doiDIV.innerHTML = linkedDOI }
};

const buildType = (typeFilterValue,x) => {
  // This function buids the structure of each item in the repository
  // It's being looped over each item in a given type
  const this_ID = typeFilterValue+"Box"+x;
  const parentElem = document.getElementById(typeFilterValue+"Container");
  // create the element box for each item
  const elem = document.createElement("div");
  elem.id = this_ID;
  elem.className = "itemBox";
  parentElem.appendChild(elem);
  if (typeFilterValue != "article"){
    const thumbBoxElem = document.createElement("div");
    thumbBoxElem.className = "thumbBox";
    elem.appendChild(thumbBoxElem);
  }
  // create titleBox inside the item element box
  const titleBoxElem = document.createElement("div");
  titleBoxElem.className = "itemTitle";
  elem.appendChild(titleBoxElem);
  // create journal title box if an article
  if (typeFilterValue == "article"){
    const JnlTitleElemName = document.createElement("div");
    JnlTitleElemName.className = "itemJnlTitle";
    elem.appendChild(JnlTitleElemName);
  }
  // Create Author box
  const authorElem = document.createElement("div");
  authorElem.className = "itemAuthors";
  elem.appendChild(authorElem);
  // Create DOI box
  const doiElem = document.createElement("div");
  doiElem.className = "itemDOI";
  elem.appendChild(doiElem);
  return(this_ID);
};
const buildPage = (filteredStuffInZenodo, typeFilterValue) => {
  // Build the DOM objects so there is one object per repo item
  // Gives new DIV a unique DOM ID
  const numberOfHits = filteredStuffInZenodo.length;
  // Create an array of element IDs for each item type
  // .keys returns the indexes of an array which are used as
  // an enumerator for the item box ID names EG articleBox0, articleBox1, etc
  const itemBoxIDs = Array.from(Array(numberOfHits).keys()).map(buildType.bind(null,typeFilterValue));
  // Put the metadata from the api call into the boxes we just built
  filteredStuffInZenodo.map((item,index) => {
    changeItemData(item,itemBoxIDs[index]);
  });
};
const typeExtract = (typeFilterValue, x) => {
  // The filter function returns true if the item type is equal to the current one
  let type = x.metadata.resource_type.type;
  let subType = x.metadata.resource_type.subtype;
  if (typeof (subType) != "undefined") {
    // Force conference papers be treated like journal articles (Hacky, probably not the best way)
    if (subType == "conferencepaper"){
      x.metadata.resource_type.subtype = "article";
    }
    type = subType; // Not all types in zenodo have subtypes
  }
  return (type == typeFilterValue);
}
const filter = (stuffInZenodo) => {
  // This function filters down to the types of entries we want to display
  // Sort the items by date
  const hits = stuffInZenodo.hits.hits.sort(function(a,b) {
    const keyA = new Date(a.metadata.publication_date);
    const keyB = new Date(b.metadata.publication_date);
    return (keyB - keyA);
  });
  // It loops over the item types so they can be displayed one at a time
  arrOfTypes.map(typeFilterValue => {
    const filteredStuffInZenodo = hits.filter(typeExtract.bind(null,typeFilterValue));
    buildPage(filteredStuffInZenodo, typeFilterValue);
  });
};

const callZenodo = async () => {
  try {
    const response = await fetch(repoPath);
    if (response.ok){
      const stuffInZenodo = await response.json();
      filter(stuffInZenodo);
      document.getElementById("loadingScreen").remove();
      document.getElementById("repo").style.display = "block";
    } 
  } catch(error){
    console.log(error);
  }
};
buildStructure();
callZenodo();