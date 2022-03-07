//------------------------------------------------variables globales---------------------------------------------------------//
const BaseUrl = "https://www.omdbapi.com/?";
const APIKey = "&apikey=f6e256e1";

//--------------------------------------------------event listeners----------------------------------------------------------//

window.addEventListener("load", () => {
    if (sessionStorage.getItem("savedPage") && sessionStorage.getItem("savedSearch") != null) {
        FetchMovies(sessionStorage.getItem("savedPage"), true);
    }
});

document.querySelector("button").addEventListener("click", () => {
    FetchMovies(1, false);
});

//-----------------------------------------------------fonctions-------------------------------------------------------------//

//fonction appelée pour afficher les 10 premiers films
//curPage : entier de la page actuelle de la recherche (elle sert à faire la requete à l'API et à construire les balises a de bas de page)
//loadSession : booleen servant a indiquer qu'on charge la page à nouveau (au lieu d'appuyer sur un bouton)
function FetchMovies(curPage, loadSession) {
    let search = document.querySelector("input");
    let searchValue;
    if (!loadSession) {
        if (search.value == "") {
            alert("la barre de recherche est vide");
            console.log(this);
            return -1;
        } 
        else {
            searchValue = search.value;
            sessionStorage.setItem("savedSearch", search.value);
        }
    }
    else {
        searchValue = sessionStorage.getItem("savedSearch");
    }
    let page = "&page=" + curPage;
    let url = BaseUrl + "s=" + searchValue + APIKey + page;
    console.log(url);
    fetch(url).then(function(response) {
        if (response.ok) {
            return response.json();
        }
        else {
        console.log("erreur reseau");
        }
    }).then(function(data) {
        if (data.Response == "True") {
            showMovies(data.Search, curPage, Math.ceil(data.totalResults/10));
        }
        else {
            console.log(data.Error);
            alert(data.Error);
        }
    })
    .catch(function(error) {
    console.log(error);
    });
}


//lis les données renvoyé par FetchMovies pour créer les cartes pour chaque film, ainsi que le HTML gérant les différentes pages
//moviesData : tableau des films
//curPage : page actuelle
//totalPages : nombre de pages à generer pour ce titre de film en particulier (dépend du nombre de résultats)
function showMovies(moviesData, curPage, totalPages) {
    sessionStorage.setItem("savedPage", curPage);
    let allCardsDiv = document.querySelector(".allCards");
    allCardsDiv.innerHTML = "";

    for (let movie of moviesData) {
        makeMovieCard(movie, allCardsDiv);
    }
    setPages(curPage, totalPages);
}


//crée le HTML des liens vers les autres pages
//curPage : page actuelle
//totalPages : nombre total de pages pour ce titre de film en particulier (dépend du nombre de résultats)
//l'utilisateur ne pourra acceder qu'a 9 pages différentes a la fois
function setPages(curPage, totalPages) {
    let pagesDiv = document.querySelector(".pages");
    pagesDiv.innerHTML = "";
    let i;
    let lastPage;
    if (totalPages > 9) {
        i = getFirstPageIndex(curPage, totalPages);
        lastPage = i + 9;
    } else {
        i = 1;
        lastPage = totalPages;
    }
    if (curPage > 1) {
        makeLink("<<", 1, pagesDiv, false);
        makeLink("<", curPage - 1, pagesDiv, false);
    }
    for (i; i < lastPage; i++) {
        if (i == curPage) {

            makeLink(i, i, pagesDiv, true);
        }
        else {
            makeLink(i, i, pagesDiv, false);
        }
    }
    if (curPage < totalPages) {
        makeLink(">", curPage + 1, pagesDiv, false);
        makeLink(">>", totalPages, pagesDiv, false);
    }
}

//crée une balise <a> avec un lien vers la page qui correspond
//content : texte affiché dans la balise html
//page : page vers laquel le lien renvoie (via un fetchMovie)
//parent : balise parent du a sur laquel on va l'append
//isCurPage : si le lien que nous créons renvoie a la page actuelle (pour lui appliquer du style particulier)
function makeLink(content, page, parent, isCurpage) {
    let a = document.createElement("a");
    a.textContent = content;
    if (isCurpage) {
        a.className = "selected";
    }
    a.addEventListener("click", () => {
        FetchMovies(page, true);
    });
    parent.appendChild(a);
}

//renvoie le premier entier à utiliser pour créer les liens vers les pages (pour que le lien de la page actuelle soit située au milieu si nécessaire);
//curPage : page actuelle
//totalPages : nombre total de pages à generer pour ce titre de film en particulier (dépend du nombre de résultats)
function getFirstPageIndex(curIndex, totalPages) {
    if (curIndex <= 5) {
        return 1;
    } else if (curIndex < totalPages - 5) {
        return curIndex - 4
    } else {
        return totalPages - 8;
    }
}

//crée le HTML pour une carte 
//movie : données du film qui va être affichées dans la carte
//parent : balise (normalement un div) dans lequel on va rajouter la carte créée
//modèle du HTML d'une card :
/*      <div class="card">
          <img src="">
          <p>titre</p>
          <p>année</p>
          <div class="synopsisDiv">
            <a>synopsis</a>
          </div
          <button>plus d'infos</button>
        </div>
*/
function makeMovieCard(movie, parent) {

    let divCard = document.createElement('div');
    divCard.className = "card";

    createPoster(movie, divCard);
    let titre = document.createElement('p');
    titre.textContent = movie.Title;
    let annee = document.createElement('p');
    annee.textContent = movie.Year;
    let synopsisDiv = document.createElement("div");
    synopsisDiv.className = "synopsisDiv";
    let synopsis = document.createElement('a');
    synopsis.textContent = "synopsis";
    synopsis.addEventListener("click", (clicked) => {
        createSynopsis(clicked.target, movie.imdbID, synopsisDiv);
    })
    let infos = document.createElement('a');
    infos.textContent = "plus d'infos";
    infos.setAttribute("href", "https://www.imdb.com/title/" + movie.imdbID + "/");

    synopsisDiv.appendChild(synopsis);
    divCard.appendChild(titre);
    divCard.appendChild(annee);
    divCard.appendChild(synopsisDiv);
    divCard.appendChild(infos);

    parent.appendChild(divCard);
}

//crée l'objet image de l'affiche d'un film, et si cette affiche n'est plus disponible, la remplace par une image par défaut
//movie : données dans laquelle on retrouve l'URL pour récuperer l'affiche
//parent : balise (normalement un div) dans lequel on va rajouter l'image créée
function createPoster(movie, parent) {
    let poster = document.createElement('img');
    fetch(movie.Poster).then(function (response) {
        poster.src = movie.Poster;
    }).catch(function (error) {
        poster.src = "default_img2.png";
    });
    parent.appendChild(poster);
}

//crée l'objet a qui va servir à afficher le synopsis du film (au moyen d'une nouvelle requete à l'API)
//movie : élement html dont on va changer la valeur suivant si le synopsis est affiché ou non
//ID : id du film, servant à retrouver les données du film (dont le synopsis) avec la requete à l'API
//parent : element html dans lequel la nouvelle balise du synopsis sera créée 
function createSynopsis(movie, ID, parent) {
    if (parent.childElementCount < 2) {
        let url = BaseUrl + "i=" + ID + APIKey;
        fetch(url).then(function (response) {
            return response.json();
        }).then(function (data) {
            console.log(data.Plot);
            let p = document.createElement("p");
            p.innerHTML = (data.Plot == "N/A") ? "synopsis non renseigné" : data.Plot;
            parent.appendChild(p);
            movie.textContent = "fermer";

        }).catch(function (error) {
            console.log(error);
        });
    }
    else {
        parent.querySelector("p").remove();
        movie.textContent = "synopsis";
    }
    
}

/*
roses are red
i like to snack
when they're happy
ducks go quack

                >(')____,  >(')____,  >(')____,  >(')____,  >(') ___,
                 (` =~~/    (` =~~/    (` =~~/    (` =~~/    (` =~~/
'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~
*/
