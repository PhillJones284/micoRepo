class itemType {
  constructor(repoType, repoTitle, repoTabTitle, zenodoType, zenodoSubType, tabColour) {
    this.repoType = repoType;
    this.repoTitle = repoTitle;
    this.repoTabTitle = repoTabTitle;
    this.zenodoType = zenodoType;
    this.zenodoSubType = zenodoSubType;
    this.tabColour = tabColour;
  }
}

const arrOfTypes = [
  new itemType('report', 'Open Reports', 'Reports', 'publication', 'report','rgb(48,134,147)'),
  new itemType('article', 'Journal articles', 'Articles',
    ['publication', 'publication'],
    ['article', 'conferencepaper'], 'rgb(75,75,80)'),
  new itemType('presentation', 'Presentations', 'Presentations', 'presentation', '', 'rgb(111,136,47)')
];

/*
To store a local copy of the zenodo API response, set up a CRON job. For example:
/usr/bin/curl -o /home/<username>/public_html/repository/repodata.json https://zenodo.org/api/records/?communities=<community name>
*/
const localRepo = true;
let repoPath;
if (localRepo === true) {
  repoPath = "/repository/repodata.json";
} else {
  const baseURL = 'https://zenodo.org/api/records/';
  const queryParams = '?communities=';
  const repoName = "morebrains_cooperative";
  repoPath = baseURL + queryParams + repoName;
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

function buildTabs(type) {
  const tabsRowElem = this.tabsRowElem;
  const tabElem = document.createElement("div");
  tabElem.appendChild(document.createTextNode(type.repoTabTitle));
  tabElem.id = type.repoType + "Tab";
  tabElem.className = "tabs";
  tabElem.onclick = () => switchView(type);
  tabsRowElem.appendChild(tabElem);
}

function buildEachType(type) {
  const repoElem = this.repoElem;
  const sectionElem = document.createElement("div");
  sectionElem.id = type.repoType + "Section";
  sectionElem.className = "repoSection";
  sectionElem.style.display = "block";
  repoElem.appendChild(sectionElem);

  const textElem = document.createElement("h1");
  const textNode = document.createTextNode(type.repoTitle);
  textElem.appendChild(textNode);
  sectionElem.appendChild(textElem);

  const containerElem = document.createElement("div");
  containerElem.id = type.repoType + "Container";
  containerElem.className = "itemContainer";
  sectionElem.appendChild(containerElem);
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

  arrOfTypes.map(buildTabs, {
    tabsRowElem: tabsRowElem
  });

  arrOfTypes.map(buildEachType, {
    repoElem: repoElem
  });
}

///////////////////////////////
// Functions to change tabs //
/////////////////////////////

function changeTabsAndType (type,index) {
  // Get IDs for the tab and section
  elemTab = document.getElementById(type.repoType+"Tab");
  elemSection = document.getElementById(type.repoType+"Section");
  // Calculate the 'off' colours (Lighter than the base colours)
  const baseColor = arrOfTypes[index].tabColour;
  const baseColorArr = baseColor.split("(")[1].split(")")[0].split(",");
  const newColorArr = baseColorArr.map(x => Math.round(255-((255-x)/4)));
  const newBGColor = "rgb(" + newColorArr.join(",") + ")";
  // Set the off colours
  elemTab.style.backgroundColor = newBGColor;
  elemTab.style.color = "rgb(77,78,80)";
  // Turn off all sections
  elemSection.style.display = "none";
}

const switchView = (whichType) => {
  // Change colours to off colours and turn off all the sections
  arrOfTypes.map(changeTabsAndType);
  // Define the tab we want
  const currTabElem = document.getElementById(whichType.repoType + "Tab");
  // Set colours for the tabs we want
  currTabElem.style.backgroundColor = whichType.tabColour;
  document.getElementById("tabLine").style.backgroundColor = whichType.tabColour;
  document.getElementById(whichType.repoType + "Tab").style.color = "white";
  // Turn on the one section for the type we want
  document.getElementById(whichType.repoType + "Section").style.display = "block";
};

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
  if ("journal" in metadata) {
    const journal = metadata.journal;
    if ("title" in journal) {
      finalString = journal.title;
    } else {
      console.log("Warning: no journal title for " + metadata.title);
    }
  } else {
    console.log("Warning: No journal record for " + metadata.title);
  }
  if ("publication_date" in metadata) {
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

const buildType = (repoType, x) => {
  // This function buids the structure of each item in the repository
  // It's being looped over each item in a given type
  const this_ID = repoType + "Box" + x;
  const parentElem = document.getElementById(repoType + "Container");
  // create the element box for each item
  const elem = document.createElement("div");
  elem.id = this_ID;
  elem.className = "itemBox";
  parentElem.appendChild(elem);
  if (repoType != "article") {
    const thumbBoxElem = document.createElement("div");
    thumbBoxElem.className = "thumbBox";
    elem.appendChild(thumbBoxElem);
  }
  // create titleBox inside the item element box
  const titleBoxElem = document.createElement("div");
  titleBoxElem.className = "itemTitle";
  elem.appendChild(titleBoxElem);
  // create journal title box if an article
  if (repoType == "article") {
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
  return (this_ID);
};

const buildPage = (filteredStuffInZenodo, repoType) => {
  // Build the DOM objects so there is one object per repo item
  // Gives new DIV a unique DOM ID
  const numberOfHits = filteredStuffInZenodo.length;
  // Create an array of element IDs for each item type
  // .keys returns the indexes of an array which are used as
  // an enumerator for the item box ID names EG articleBox0, articleBox1, etc
  const itemBoxIDs = Array.from(Array(numberOfHits).keys()).map(buildType.bind(null, repoType));
  // Put the metadata from the api call into the boxes we just built
  filteredStuffInZenodo.map((item, index) => {
    changeItemData(item, itemBoxIDs[index]);
  });
};

function typeExtract (item) {
  const typeToMatch = [this.typeObjFilt.zenodoType,this.typeObjFilt.zenodoSubType];
  const typeOfItem = [item.metadata.resource_type.type, item.metadata.resource_type.subtype];
  if (Array.isArray(typeToMatch[0])){
    let transposedTypeToMatch = typeToMatch[0].map((x,i) => typeToMatch.map(x => x[i]));
    transposedTypeToMatch = transposedTypeToMatch.map(x => x.join());
    return (transposedTypeToMatch.includes(typeOfItem.join()));
  }
  return (typeToMatch.join() == typeOfItem.join())
};

const sortAndGroup = (stuffInZenodo) => {
  // This function filters down to the types of entries we want to display
  // Sort the items by date
  const hits = stuffInZenodo.hits.hits.sort(function (a, b) {
    const keyA = new Date(a.metadata.publication_date);
    const keyB = new Date(b.metadata.publication_date);
    return (keyB - keyA);
  });
  // It loops over the item types so they can be displayed one at a time

  arrOfTypes.map(typeObjFilt => {
    const filteredStuffInZenodo = hits.filter(typeExtract,{typeObjFilt:typeObjFilt});
    //console.log(filteredStuffInZenodo);
    buildPage(filteredStuffInZenodo,typeObjFilt.repoType);
  });
};

const callZenodo = async () => {
  try {
    const response = await fetch(repoPath);
    if (response.ok) {
      const stuffInZenodo = await response.json();
      sortAndGroup(stuffInZenodo);
      switchView(arrOfTypes[0]);
      document.getElementById("loadingScreen").remove();
      document.getElementById("repo").style.display = "block";
    }
  } catch (error) {
    console.log(error);
  }
};

buildStructure();
callZenodo();