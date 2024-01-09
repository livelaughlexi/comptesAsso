/*** NOTE: 
 * Ce code réutilisant plusieurs fois des snippets, les commentaires explicatifs
 * ou de mention de récupération de code sont mentionnés uniquement lors de leur première
 * instance, afin d'éviter une surcharge. 
 * ***/

// Générer l'infobox
d3.select("body").append("div")
    .attr("id", "infobox")
    .style("opacity", 0)
    .style("position", "fixed");

// Les catégories étant des nombres dans le fichier de données, création d'un array pour les textes à afficher dans les infobox
const categoryLabels = ["Hors-Saison","Saison 7","Vie associative","Gestion associative"]

/*** VISUALISATION 1: Dépenses et entrées côte à côte ***/

// Chargement des données
let visu1 = d3.csv("data/spendingData.csv", d => {
	return {
		amount: +d.amount,
		type: +d.type,
		category: +d.category,
		subCat : d.subCat,
		paidBy : d.paidBy
	};
}).then(function(data) {

// Définition des couleurs, des centres et des échelles
let colorScale = ['#34a867', '#cc4c4d'];
let xCenter = [175, 500];
let scaleRadius = d3.scaleLinear()
			.domain([d3.min(data, d => d.amount), d3.max(data, d => d.amount)])
			.range([0,55]);

// forceSimulation adaptée depuis le code de Cuthbert Chow avec l'aide de ChatGPT
let simulation = d3.forceSimulation(data)
	.force('charge', d3.forceManyBody().strength(5))
	.force('x', d3.forceX().x(function(d) {
		return xCenter[d.type];
	}))
	.force('y', d3.forceY().y(function(d) {
		return 250
	}))
	.force('collision', d3.forceCollide().radius(function(d) {
		return scaleRadius(d.amount);
	}))
	.on('tick', ticked);

function ticked() {
	let u = d3.select('#svg1')
		.selectAll('circle')
		.data(data)
		.join('circle')
		.attr('r', (d) => scaleRadius(d.amount))
		.attr('id', (d) => d.subCat)
		.style('fill', (d) => colorScale[d.type])
		.attr('cx', (d) => d.x)
		.attr('cy', (d) => d.y)
		.on('mouseover', showInfo)
		.on('mouseout', hideInfo)
	}
	
	// Affichage et disparition de l'infobox, adapté depuis le code de Cuthbert Chow
	function showInfo(event, d) {
        d3.select("#infobox")
            .style("opacity", 1)
            .html("<strong>Prix:</strong> " + d.amount + 
			"<br /> <strong>Catégorie:</strong> " + categoryLabels[d.category] +
			"<br /> <strong>Sous-catégorie:</strong> " + d.subCat +
			"<br /> <strong>Payé par:</strong> " + d.paidBy)
    }

	function hideInfo() {
        d3.select("#infobox")
            .style("opacity", 0);
    }
});

/*** VISUALISATION 2: DÉPENSES ***/

/* Visualisation 2: Toutes les dépenses */

// Sélectionner le bouton et y joindre une fonction
let boutton2 = d3.select("#buttonVisu2")
				.on('click', visu2)

// Fonction pour la génération des cercles
function visu2() {
	let visu2 = d3.csv("data/spendingData.csv", d => {
		return {
			amount: +d.amount,
			type: d.type,
			category: +d.category,
			subCat : d.subCat,
			paidBy : d.paidBy
		};
	}).then(function(data) {
	
	// Filtrer pour avoir les dépenses uniquement
	const depenses = d3.filter(data, (d) => d.type == 1)
	
	let colorScale = ["var(--horsSaison)", "var(--saison7)", "var(--vieAsso)", "var(--gestionAsso)"];
	let xCenter = [100, 400, 100, 400];
	let yCenter = [150, 150, 500, 500];
	let scaleRadius = d3.scaleLinear()
				.domain([d3.min(depenses, d => d.amount), d3.max(depenses, d => d.amount)])
				.range([0,100]);
	
	let simulation = d3.forceSimulation(depenses)
		.force('charge', d3.forceManyBody().strength(5))
		.force('x', d3.forceX().x(function(d) {
			return xCenter[d.category];
		}))
		.force('y', d3.forceY().y(function(d) {
			return yCenter[d.category]
		}))
		.force('collision', d3.forceCollide().radius(function(d) {
			return scaleRadius(d.amount);
		}))
		.on('tick', ticked);
	
	function ticked() {
		let u = d3.select('#svg2')
			.selectAll('circle')
			.data(depenses)
			.join('circle')
			.attr('r', (d) => scaleRadius(d.amount))
			.style('fill', (d) => colorScale[d.category])
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.on('mouseover', showInfo)
			.on('mouseout', hideInfo)
	}
	
	function showInfo(event, d) {
        d3.select("#infobox")
            .style("opacity", 1)
            .html("<strong>Prix:</strong> " + d.amount + 
			"<br /> <strong>Catégorie:</strong> " + categoryLabels[d.category] +
			"<br /> <strong>Sous-catégorie:</strong> " + d.subCat +
			"<br /> <strong>Payé par:</strong> " + d.paidBy)
    }

	function hideInfo() {
        d3.select("#infobox")
            .style("opacity", 0);
    }
		
	});

	// Génération des légendes
	let colorScaleLegende = ["var(--horsSaison)", "var(--saison7)", "var(--vieAsso)", "var(--gestionAsso)"]
	let labelLegende = ["Hors-Saison (y.c Hors-Saison & Animations)", "Saison 7", "Vie associative (y.c Stages)", "Gestion associative"]

	let legendeSVG = d3.select("#legendeDepenses")
	let legendeDots = legendeSVG.selectAll("circle")
			.data(labelLegende)
			.enter()
			.append("circle")
				.attr("cx", 10)
				.attr("cy", (d, i) => 10 + i*25)
				.attr("r", 7)
				.style("fill", (d, i) => colorScaleLegende[i])

	let legendeLabel = legendeSVG.selectAll("text")
				.data(labelLegende)
				.enter()
				.append("text")
					.attr("x", 20)
					.attr("y", (d, i) => 15 + i*25)
					.attr("r", 7)
					.style("fill", (d, i) => colorScaleLegende[i])
					.text((d) => d)
					.attr("text-anchor", "left")
}

/* Visualisation 2.1: Dépenses par catégorie */

let select2_1 = d3.select("#visu2_1")
				.on('change', visu2_1)


function visu2_1() {
	let visu2_1 = d3.csv("data/spendingData.csv", d => {
		return {
			amount: +d.amount,
			type: d.type,
			category: +d.category,
			subCat : d.subCat,
			paidBy : d.paidBy
		};
	}).then(function(data) {
		// Récupérer la valeur du select
		let selectValue = d3.select("#visu2_1").node().value
		
		// Déclaration de variables
		let depenses = []
		let baseColor = ""

		// Mdification des variables (array de données et couleur) en fonction de la valeur du select
		if (selectValue == "horsSaison") {
			depenses = data.filter((d) => d.type == 1 && d.category == 0)
			baseColor = "var(--horsSaison"
		} else if (selectValue == "saison7") {
			depenses = data.filter((d) => d.type == 1 && d.category == 1)
			baseColor = "var(--saison7"
		} else if (selectValue == "vieAsso") {
			depenses = data.filter((d) => d.type == 1 && d.category == 2)
			baseColor = "var(--vieAsso)"
		} else if (selectValue == "gestionAsso") {
			depenses = data.filter((d) => d.type == 1 && d.category == 3)
			baseColor = "var(--gestionAsso)"
		} 

		// Appel d'une fonction pour la génération des cercles (amménagement nécessaire sinon la forceSimulation constatait systématiquement un array vide)
		callSimulationDepenses(depenses, baseColor);
	})};

	// Fonction pour la génération des cercles
	function callSimulationDepenses(depenses, baseColor) {
	let xCenter = [300];
	let yCenter = [300];
	let scaleRadius = d3.scaleLinear()
				.domain([d3.min(depenses, d => d.amount), d3.max(depenses, d => d.amount)])
				.range([0,150]);
	
	let simulation = d3.forceSimulation(depenses)
		.force('charge', d3.forceManyBody().strength(5))
		.force('x', d3.forceX().x(function(d) {
			return xCenter;
		}))
		.force('y', d3.forceY().y(function(d) {
			return yCenter
		}))
		.force('collision', d3.forceCollide().radius(function(d) {
			return scaleRadius(d.amount);
		}))
		.on('tick', ticked);
	
	function ticked() {
		let u = d3.select('#svg2')
			.selectAll('circle')
			.data(depenses)
			.join('circle')
			.attr('r', (d) => scaleRadius(d.amount))
			.style('fill', baseColor)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.on('mouseover', showInfo)
			.on('mouseout', hideInfo)
	}
	
	function showInfo(event, d) {
        d3.select("#infobox")
            .style("opacity", 1)
            .html("<strong>Prix:</strong> " + d.amount + 
			"<br /> <strong>Catégorie:</strong> " + categoryLabels[d.category] +
			"<br /> <strong>Sous-catégorie:</strong> " + d.subCat +
			"<br /> <strong>Payé par:</strong> " + d.paidBy)
    }

	function hideInfo() {
        d3.select("#infobox")
            .style("opacity", 0);
    }
		
	
};	

/*** VISUALISATION 3: ENTRÉES */
let boutton3 = d3.select("#buttonVisu3")
				.on('click', visu3)

function visu3() {
	let visu3 = d3.csv("data/spendingData.csv", d => {
		return {
			amount: +d.amount,
			type: d.type,
			category: +d.category,
			subCat : d.subCat,
			paidBy : d.paidBy
		};
	}).then(function(data) {
	
	const entrees = d3.filter(data, (d) => d.type == 0)
	
	let colorScale = ["var(--horsSaison)", "var(--saison7)", "var(--vieAsso)", "var(--gestionAsso)"];
	let xCenter = [100, 400, 0, 250];
	let yCenter = [150, 150, 0, 500];
	let scaleRadius = d3.scaleLinear()
				.domain([d3.min(entrees, d => d.amount), d3.max(entrees, d => d.amount)])
				.range([0,50]);
	
	let simulation = d3.forceSimulation(entrees)
		.force('charge', d3.forceManyBody().strength(5))
		.force('x', d3.forceX().x(function(d) {
			return xCenter[d.category];
		}))
		.force('y', d3.forceY().y(function(d) {
			return yCenter[d.category]
		}))
		.force('collision', d3.forceCollide().radius(function(d) {
			return scaleRadius(d.amount);
		}))
		.on('tick', ticked);
	
	function ticked() {
		let u = d3.select('#svg3')
			.selectAll('circle')
			.data(entrees)
			.join('circle')
			.attr('r', (d) => scaleRadius(d.amount))
			.style('fill', (d) => colorScale[d.category])
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.on('mouseover', showInfo)
			.on('mouseout', hideInfo)
	}
	
	function showInfo(event, d) {
        d3.select("#infobox")
            .style("opacity", 1)
            .html("<strong>Prix:</strong> " + d.amount + 
			"<br /> <strong>Catégorie:</strong> " + categoryLabels[d.category] +
			"<br /> <strong>Sous-catégorie:</strong> " + d.subCat +
			"<br /> <strong>Payé par:</strong> " + d.paidBy)
    }

	function hideInfo() {
        d3.select("#infobox")
            .style("opacity", 0);
    
		}
	});

	let colorScaleLegende = ["var(--horsSaison)", "var(--saison7)", "var(--vieAsso)", "var(--gestionAsso"]
	let labelLegende = ["Hors-Saison (y.c Club LIG et Stages)", "Saison 7", "Vie Associative", "Gestion associative (Cotis, Dons, Soutiens)"]

	let legendeSVG = d3.select("#legendeEntrees")
	let legendeDots = legendeSVG.selectAll("circle")
			.data(labelLegende)
			.enter()
			.append("circle")
				.attr("cx", 10)
				.attr("cy", (d, i) => 10 + i*25)
				.attr("r", 7)
				.style("fill", (d, i) => colorScaleLegende[i])

	let legendeLabel = legendeSVG.selectAll("text")
				.data(labelLegende)
				.enter()
				.append("text")
					.attr("x", 20)
					.attr("y", (d, i) => 15 + i*25)
					.attr("r", 7)
					.style("fill", (d, i) => colorScaleLegende[i])
					.text((d) => d)
					.attr("text-anchor", "left")
}

/* Visualisation 3.1: Entrées par sous catégories */

let select3_1 = d3.select("#visu3_1")
				.on('change', visu3_1);

function visu3_1() {
	let visu3_1 = d3.csv("data/spendingData.csv", d => {
		return {
			amount: +d.amount,
			type: d.type,
			category: +d.category,
			subCat : d.subCat,
			paidBy : d.paidBy
		};
	}).then(function(data) {

		let selectValue = d3.select("#visu3_1").node().value
	
		let entrees = []
		let baseColor = ""

		if (selectValue == "horsSaison") {
			entrees = data.filter((d) => d.type == 0 && d.category == 0)
			baseColor = "var(--horsSaison"
		} else if (selectValue == "saison7") {
			entrees = data.filter((d) => d.type == 0 && d.category == 1)
			baseColor = "var(--saison7"
		} else if (selectValue == "gestionAsso") {
			entrees = data.filter((d) => d.type == 0 && d.category == 3)
			baseColor = "var(--gestionAsso)"
		} 

		callSimulationEntrees(entrees, baseColor);
	})};

function callSimulationEntrees(entrees, baseColor) {
	let xCenter = [300];
	let yCenter = [300];
	let scaleRadius = d3.scaleLinear()
				.domain([d3.min(entrees, d => d.amount), d3.max(entrees, d => d.amount)])
				.range([0,150]);
	
	let simulation = d3.forceSimulation(entrees)
		.force('charge', d3.forceManyBody().strength(5))
		.force('x', d3.forceX().x(function(d) {
			return xCenter;
		}))
		.force('y', d3.forceY().y(function(d) {
			return yCenter
		}))
		.force('collision', d3.forceCollide().radius(function(d) {
			return scaleRadius(d.amount);
		}))
		.on('tick', ticked);
	
	function ticked() {
		let u = d3.select('#svg3')
			.selectAll('circle')
			.data(entrees)
			.join('circle')
			.attr('r', (d) => scaleRadius(d.amount))
			.style('fill', baseColor)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.on('mouseover', showInfo)
			.on('mouseout', hideInfo)
	}
	
	function showInfo(event, d) {
        d3.select("#infobox")
            .style("opacity", 1)
            .html("<strong>Prix:</strong> " + d.amount + 
			"<br /> <strong>Catégorie:</strong> " + categoryLabels[d.category] +
			"<br /> <strong>Sous-catégorie:</strong> " + d.subCat +
			"<br /> <strong>Payé par:</strong> " + d.paidBy)
    }

	function hideInfo() {
        d3.select("#infobox")
            .style("opacity", 0);
    }
		
	
};	

/*** VISUALISATION 4 : AU FIL DE L'ANNÉE ***/

let boutton4 = d3.select("#buttonVisu4")
				.on("click", visu4)

function visu4() {
	// Création de la heatmap (1ere rangée)
	let cal = new CalHeatmap();
	cal.paint({
		itemSelector: "#row1",
		range: 4, // Limiter à 4 mois (pour faire 3 lignes de 3 mois)
		domain : {type: "month",
				gutter: 50,
	},
		subDomain : {type: "day",
					width: 15,
					height: 15,
			},
		rowLimit: 4,
		date: {start : new Date("2022-11-1"), locale: "fr"},
		data : {
			source: "data/datesData.csv", // Récupérer les données
			type: "csv",
			x : "date",
			y : datum => {return +datum["sum"]},
		},
		scale : { // Définir les règles pour la coloration des carrés
			color : {
				range: ['#cc4c4d', '#34a867'],
				interpolate: 'hsl',
				type: "linear",
				domain: [-250, 250]
			}
		}
	}, [ [Tooltip, {
		enabled: true,
		text : function (date, value, dayjsDate) {
			return (
				( value ? value + " CHF" : "0 CHF") + " le " + dayjsDate.format('l')
			)
		} // Activer l'infobox native

	}]]
	);

	// Répéter les opérations pour les 2 rangées suivantes
	let cal2 = new CalHeatmap();
	cal2.paint({
		itemSelector: "#row2",
		range: 4,
		domain : {type: "month",
				gutter: 50},
		subDomain : {type: "day",
					color: "#CDCDCD",
					height: 15,
					width: 15,
			},
		rowLimit: 4,
		date: {start : new Date("2023-02-01"), locale: "fr"},
		data : {
			source: "data/datesData.csv",
			type: "csv",
			x : "date",
			y : datum => {return +datum["sum"]},
		},
		scale : {
			color : {
				range: ['#cc4c4d', '#34a867'],
				interpolate: 'hsl',
				type: "linear",
				domain: [-250, 250]
			}
		}
	}, [ [Tooltip, {
		enabled: true,
		text : function (date, value, dayjsDate) {
			return (
				( value ? value + " CHF" : "0 CHF") + " le " + dayjsDate.format('l')
			)
		}

	}]]
	)

	let cal3 = new CalHeatmap();
	cal3.paint({
		itemSelector: "#row3",
		range: 4,
		domain : {type: "month",
				gutter: 50},
		subDomain : {type: "day",
					color: "#CDCDCD",
					height: 15,
					width: 15
			},
		rowLimit: 4,
		date: {start : new Date("2023-06-01"), locale: "fr"},
		data : {
			source: "data/datesData.csv",
			type: "csv",
			x : "date",
			y : datum => {return +datum["sum"]},
		},
		scale : {
			color : {
				range: ['#cc4c4d', '#34a867'],
				interpolate: 'hsl',
				type: "linear",
				domain: [-250, 250]
			}
		}
	}, [ [Tooltip, {
		enabled: true,
		text : function (date, value, dayjsDate) {
			return (
				( value ? value + " CHF" : "0 CHF") + " le " + dayjsDate.format('l')
			)
		}

	}]]
	)
}


/*** VISUALISATION 5: QUI A DEPENSE LE PLUS ***/

let button5 = d3.select("#buttonVisu5")
			.on("click", visu5)
	
function visu5() {
	let visu5 = d3.csv("data/spendingData.csv", d => {
		return {
			amount: +d.amount,
			type: d.type,
			category: +d.category,
			subCat : d.subCat,
			paidBy : d.paidBy
		};
	}).then(function(data) {
		// Filtrer les données pour retirer les données ignorées
		const filterData = data.filter((d) => d.type == 1 && d.paidBy !== "factureIn" && d.paidBy !=="card" && d.paidBy !== "cash")
		
		// Calculer la somme en fonction de la valeur de paidBy
		let totalAmounts = d3.rollup(
						filterData, 
						v => d3.sum(v, d => d.amount), 
						d => d.paidBy)
		
		// Transformer en array pour que les données puissent être exploitées par d3
		let dataArray = Array.from(totalAmounts, ([key, value]) => ({ key, value }));
		
		// Retirer valeurs < 20 pour assurer la lisibilité
		dataArray = dataArray.filter(entry => entry.value >= 20)


	//Générer le bar chart. Code issu de la documentation d3

	// Déclarer les variables de taille pour la visualisation
	const width = 928;
	const height = 800;
	const marginTop = 30;
	const marginRight = 0;
	const marginBottom = 30;
	const marginLeft = 40;

	// Echelle pour l'axe des X en triant les données dans l'ordre décroissant
	const x = d3.scaleBand()
		.domain(d3.groupSort(dataArray, ([d]) => -d.value, (d) => d.key))
		.range([marginLeft, width - marginRight])
		.padding(0.1);

	// Echelle pour l'axe des Y
	const y = d3.scaleLinear()
		.domain([0, d3.max(dataArray, d => d.value)])
		.range([height - marginBottom, marginTop]);

	// Sélectionner le svg
	const svg = d3.select("#svg5")
				.attr("width", width)
				.attr("height", height)
				.attr("viewBox", [0, 0, width, height])
				.attr("style", "max-width: 100%; height: auto;");

	// Générer les rectangles
	svg.append("g")
		.attr("fill", "var(--accentBlue")
		.selectAll()
		.data(dataArray)
		.join("rect")
		.attr("x", d => x(d.key))
		.attr("y", d => y(d.value))
		.attr("height", d => y(0) - y(d.value))
		.attr("width", x.bandwidth())
		.on('mouseover', showInfo)
		.on('mouseout', hideInfo);

	// Ajouter l'axe des X
	svg.append("g")
		.attr("transform", `translate(0,${height - marginBottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(0))

	// Ajouter l'axe des Y
	svg.append("g")
		.attr("transform", `translate(${marginLeft},0)`)
		.call(d3.axisLeft(y).tickFormat(y => (y).toFixed()))
		.call(g => g.select(".domain").remove())
		.call(g => g.append("text")
			.attr("x", -marginLeft)
			.attr("y", 10)
			.attr("fill", "currentColor")
			.attr("text-anchor", "start"))
	
	// Fonction pour l'apparition de l'infobox
	function showInfo(event, d) {
	d3.select("#infobox")
		.style("opacity", 1)
		.html("<strong>Nom:</strong> " + d.key + 
		"<br /> <strong>Total:</strong> " + d.value)
	}
		
	function hideInfo() {
		d3.select("#infobox")
		.style("opacity", 0);
	}

	
})}