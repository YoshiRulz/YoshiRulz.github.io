"use strict";
window.d = document; d.gEBC = d.getElementsByClassName; d.gEBI = d.getElementById; d.gEBN = d.getElementsByName; d.gEBT = d.getElementsByTagName;

var createSVGElement = function(tag) {
	return document.createElementNS("http://www.w3.org/2000/svg", tag);
};
var setAttrsOnSVGElem = function(e, attrs) {
	for (let attr in attrs) e.setAttributeNS(null, attr, attrs[attr]);
};

var setValue = function(e, v) {
	e.setAttribute("value", v);
	e.value = v;
};

var filterElemsByClass = function(elems, c) {
	return Array.from(elems).filter(function(e) {return e.className == c;});
};
var filterElemsByLabelledName = function(elems, l) {
	return Array.from(elems).filter(function(e) {return e.firstElementChild.name == l;});
};
var filterElemsByName = function(elems, n) {
	return Array.from(elems).filter(function(e) {return e.name == n;});
};
var filterElemsByTag = function(elems, t) {
	return Array.from(elems).filter(function(e) {return e.tagName == t.toUpperCase();});
};

var designs = [
	"field", "quadrisection", "nordic-cross", "cross", "saltire", "pall",
	"bend-d", "bend-s", "per-bend-d", "per-bend-s",
	"bars", "h-duoband", "h-triband", "h-tetraband", "h-pentaband", "h-hexaband", "h-heptaband",
	"v-duoband", "v-triband", "v-tetraband"
];

var colourParts = ["00"];
for (let n of [1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"]) colourParts.push(n + "F");
var simpleColours = [
	"000000", "FFFFFF", // Grayscale
	"CF0000", // Reds
	"FF8F00", // Oranges
	"FFDF00", // Yellow
	"007F4F", // Cyans
	"1F006F" // Blues
];
var randomSimpleColour = function() {return simpleColours[~~(Math.random() * simpleColours.length)];};
var randomizeInput = function(e, randColour) {
	switch (e.type) {
		case "checkbox":
			return e.checked = Math.random() < 0.5 ? true : false;
		case "color":
			return setValue(e, "#" + (randColour
					? colourParts[~~(Math.random() * 16)] + colourParts[~~(Math.random() * 16)] + colourParts[~~(Math.random() * 16)]
					: randomSimpleColour()
				));
		case "number":
			return setValue(e, Number.parseFloat(e.min) + ~~(Math.random() * (e.max - e.min) / e.step) * e.step);
	}
};
var randomizeSelect = function(e) {
	if (e.name == "design") return;
	e.selectedIndex = ~~(Math.random() * e.options.length);
};
var randomizeRecursively = function(p, randColour) {
	if (typeof randColour == "undefined") randColour = !d.gEBN("randomize-limit-colours")[0].checked;
	for (let e of p.children) switch (e.tagName.toLowerCase()) {
		case "input": randomizeInput(e, randColour); break;
		case "select": randomizeSelect(e); break;
		case "fieldset": if (e.id == "randomize") break;
		case "label": randomizeRecursively(e, randColour); break;
	}
};
var randomizeAll = function() {
	if (d.gEBN("randomize-design")[0].checked) d.gEBN("design")[0].value = designs[~~(Math.random() * designs.length)];
	updateDesign();
	randomizeRecursively(d.gEBI(d.gEBN("design")[0].value));
//TODO extras
	updateView();
	randomizeButton();
};
var diceChars = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
var randomizeButton = function() {
	d.gEBI("randomize-button").innerHTML = diceChars[~~(Math.random() * 6)] + " Randomize " + diceChars[~~(Math.random() * 6)];
};

var showPattern = function() {
	d.gEBI(d.gEBN("pattern")[0].value).hidden = false;
	updateView();
};
var hideSection = function(section) {
	d.gEBI(section).hidden = true;
	updateView();
};

var addSectionChildIntern = function(sectionID, childClass) {
	let section = d.gEBI(sectionID);
	let temp = filterElemsByName(section.children, childClass + "-type")[0];
	let childType = temp.value;
	section.removeChild(temp);
	section.removeChild(filterElemsByClass(section.children, childClass)[0]);
	section.removeChild(filterElemsByTag(section.children, "br")[1]);
	for (let e of d.gEBI("template-" + childClass + "-" + childType).children)
		section.insertBefore(e.cloneNode(true), section.children[section.childElementCount - 1]);
	filterElemsByTag(section.children[section.childElementCount - 2].children, "button")[0]
		.setAttribute("onclick", "removeSectionChild('" + sectionID + "', '" + childClass + "')");
	randomizeRecursively(section.children[section.childElementCount - 2]);
};
var addSectionChild = function(sectionID, childClass) {
	addSectionChildIntern();
	updateView();
};
var removeSectionChildIntern = function(sectionID, childClass) {
	let section = d.gEBI(sectionID);
	section.removeChild(filterElemsByClass(section.children, childClass)[0]);
	section.insertBefore(document.createElement("br"), section.children[section.childElementCount - 2]);
	for (let e of d.gEBI("template-" + childClass + "-add").children)
		section.insertBefore(e.cloneNode(true), section.children[section.childElementCount - 2]);
	section.children[section.childElementCount - 4]
		.setAttribute("onclick", "addSectionChild('" + sectionID + "', '" + childClass + "')");
};
var removeSectionChild = function(sectionID, childClass) {
	removeSectionChildIntern();
	updateView();
};

var updateDesign = function() {
	for (let id of designs) d.gEBI(id).hidden = true;
	d.gEBI(d.gEBN("design")[0].value).hidden = false;
};

var updateView = function() {
	let view = d.gEBI("view");
	if (view.hasChildNodes()) view.removeChild(view.firstChild);
	let size = d.gEBN("aspect")[0].value.split("-").reverse();
	size[0] *= 100;
	size[1] *= 100;
	view = view.appendChild(createSVGElement("svg"));
	setAttrsOnSVGElem(view, {viewBox: "0 0 " + size[0] + " " + size[1]});
	view.style.transform = false ? "scaleX(-1)" : null;
	let newElem;
	switch (d.gEBN("design")[0].value) {

		//<circle cx="250" cy="150" r="150" stroke="green" stroke-width="4" fill="yellow" />
		case "field":
			setAttrsOnSVGElem(view.appendChild(createSVGElement("rect")), {
				width: size[0], height: size[1],
				x: 0, y: 0,
				fill: filterElemsByLabelledName(filterElemsByTag(d.gEBI("field").children, "label"), "fill")[0]
					.firstElementChild.value
			});
			break;

		case "quadrisection":
			break;

		case "nordic-cross":
			//cross divides field into squares on hoist and rectangles on fly
			break;

		case "cross":
			break;

		case "saltire":
			break;

		case "pall":
			break;

		case "bend-d":
			break;

		case "bend-s":
			break;

		case "per-bend-d":
			break;

		case "per-bend-s":
			break;

		case "bars":
			break;

		case "v-duoband":
			let bandWidths = d.gEBN("v-duoband-ratio")[0].value.split("-");
			for (let i = 0; i < bandWidths.length; i++) bandWidths[i] = Number.parseInt(bandWidths[i]);
			let sum = bandWidths.reduce((a,b)=>a+b);
			for (let i = 0; i < bandWidths.length; i++) bandWidths[i] *= size[0] / sum;
			//bandWidths is now absolute width out of size[0] e.g. [200, 300] for 3:5, band ratio 2:3
			for (let e of filterElemsByClass(d.gEBI("v-duoband").children, "band")) {
				let attrs = {
					width: bandWidths[e.dataset.vexorder - 1], height: size[1],
					x: 0, y: 0,
					fill: filterElemsByLabelledName(filterElemsByTag(e.children, "label"), "fill")[0]
						.firstElementChild.value
				};
				if (e.dataset.vexorder > 1)
					for (let i = 0; i < e.dataset.vexorder - 1; i++) attrs.x += bandWidths[i];
				setAttrsOnSVGElem(view.appendChild(createSVGElement("rect")), attrs);
			}
			break;

		case "v-triband":
			break;

		case "v-tetraband":
			break;

		case "h-duoband":
			break;

		case "h-triband":
			break;

		case "h-tetraband":
			break;

		case "h-pentaband":
			break;

		case "h-hexaband":
			break;

		case "h-heptaband": // Blame Zimbabwe.
			break;
	}

	let patternOpts = d.gEBI("bordure");
	if (!patternOpts.hidden) {
//TODO bordure
	}

	patternOpts = d.gEBI("canton");
	if (!patternOpts.hidden) {
//TODO canton
	}

	patternOpts = d.gEBI("chevron");
	if (!patternOpts.hidden) {
		let points = [
			[0, 0],
			[size[0] * Number.parseInt(d.gEBN("chevron-width")[0].value) / 12, size[1] / 2],
			[0, size[1]]
		];
		let attrs = {
			fill: filterElemsByName(Array.from(patternOpts.children)
				.map(function(e) {return e.firstElementChild;})
				.filter(function(e) {return e != null;}), "fill")[0].value
		};
		for (let e of filterElemsByTag(filterElemsByClass(patternOpts.children, "fimbriation"), "fieldset")) {
			let attrs1 = {
				fill: filterElemsByLabelledName(filterElemsByTag(e.children, "label"), "fill")[0]
					.firstElementChild.value,
				points: points.join(" ")
			};
			setAttrsOnSVGElem(view.appendChild(createSVGElement("polygon")), attrs1);
			if (filterElemsByName(e.children, "fimbriation-type")[0].value == "thin") {
				points[0][1] = size[1] / 20;
				points[1][0] *= 0.9;
				points[2][1] *= 0.95;
			} else {
				points[0][1] = size[1] / 10;
				points[1][0] *= 0.8;
				points[2][1] *= 0.9;
			}
		}
		attrs.points = points.join(" ");
		setAttrsOnSVGElem(view.appendChild(createSVGElement("polygon")), attrs);
	}

	patternOpts = d.gEBI("frame");
	if (!patternOpts.hidden) {
//TODO frame
	}
};
