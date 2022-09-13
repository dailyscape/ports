const storage = window.localStorage;

let resources = {
    'bones': {
        '26283': {'qty': 4},
        '26286': {'qty': 4},
        '38823': {'qty': 4},
        '33896': {'qty': 4},
        '26292': {'qty': 2},
        '38828': {'qty': 2},
        '26289': {'qty': 2},
        '33901': {'qty': 2},
        '26307': {'qty': 10},
        '26301': {'qty': 10},
        '26295': {'qty': 10},
        '26304': {'qty': 10},
        '26310': {'qty': 10},
        '26298': {'qty': 10},
        '48343': {'qty': 40, 'other': {'28436': 1000, '47506': 100, '6573': 2}, 'desc': '60 silent comps'}
    },
    'chi': {
        '26337': {'qty': 30},
        '26339': {'qty': 50},
        '26338': {'qty': 80},
        '48347': {'qty': 400, 'other': {'47506': 100, '6573': 2}, 'desc': '20 seasinger asari'}
    },
    'lacquer': {
        '26346': {'qty': 30},
        '26348': {'qty': 50},
        '26347': {'qty': 80},
        '48343': {'qty': 400, 'other': {'47506': 100, '6573': 2}, 'desc': '20 Death Lotus tabi'}
    },
    'plate': {
        '26325': {'qty': 30},
        '26327': {'qty': 50},
        '26326': {'qty': 80},
        '48345': {'qty': 400, 'other': {'47506': 100, '6573': 2}, 'desc': '20 tetsu kogake'}
    },
    'spices': {
        '42254': {'qty': 1, 'other': {'42251': 1}},
        '26313': {'qty': 1, 'other': {'15272': 1}}
    },
    'pearls': {
        '30576': {'qty': 80}
    },
    'scales': {
        '30568': {'qty': 80}
    }
}

/**
 * We want to pull a list of all items for each ports resources and determine what is the
 * most valuable item that can be produce (maybe top 3 in case low sales volume) and show how many
 * the resource is requried to create it (and also other ingredients needed)
 */
const portsResources = async () => {
    const sampleRow = document.querySelector('#sample_row');
    const table = document.getElementById('portstable');
    const tbody = table.querySelector('tbody');

    for (let resource in resources) {
        for (let productid in resources[resource]) {
            let rowClone = sampleRow.content.cloneNode(true);
            let newRow = rowClone.querySelector('tr');

            item = await getItem(productid);

            let others = [];
            if (resources[resource][productid].other) {
                for (let otherid in resources[resource][productid].other) {
                    otheritem = await getItem(otherid);
                    others.push(otheritem);
                }
            }

            newRow.children[0].dataset.value = resources[resource][productid].qty;
            newRow.children[0].innerHTML = resources[resource][productid].qty;
            newRow.children[1].dataset.name = resource;
            newRow.children[1].innerHTML = '<img src="./images/' + resource + '.png"> ' + resource;
            newRow.children[2].dataset.name = item.name;

            let wikiLink = '<a href="https://runescape.wiki/w/' + item.name.replace(/\s+/g, '_') + '" target="_blank" rel=\"noreferrer noopener\">';
            newRow.children[2].innerHTML = wikiLink + '<img src="/rsdata/images/' + productid + '.gif">' + item.name + '</a>';

            let othercosts = 0;
            for (other of others) {
                let wikiLink = '<a href="https://runescape.wiki/w/' + other.name.replace(/\s+/g, '_') + '" target="_blank" rel=\"noreferrer noopener\">';
                newRow.children[3].innerHTML += wikiLink + '<img src="/rsdata/images/' + other.id + '.gif">' + other.name + '</a> x' + resources[resource][productid].other[other.id] + '<br>';
                othercosts += other.price * resources[resource][productid].other[other.id];
            }
            newRow.children[3].dataset.value = othercosts;
            if (othercosts > 0) {
                newRow.children[3].innerHTML += othercosts.toLocaleString() + '<span class="coin">●</span>';
            }

            newRow.children[4].dataset.value = item.price;
            newRow.children[4].innerHTML = item.price.toLocaleString();
            newRow.children[5].dataset.value = (item.price - othercosts) / resources[resource][productid].qty;
            newRow.children[5].innerHTML = Math.floor((item.price - othercosts) / resources[resource][productid].qty).toLocaleString();

            tbody.appendChild(newRow);
        }
    }
};

const getItem = async (id) => {
    let apiUrl = "/rsdata/items/" + id + ".json";
    return await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    });
};

const makeSortable = () => {
    const table = document.getElementById('portstable');
    const ths = table.querySelectorAll('th');
    const tbody = table.querySelector('tbody');

    for (let th of ths) {
        th.addEventListener('click', function(e) {
            const tableRows = Array.from(tbody.querySelectorAll('tr'));
            let columnindex = [...ths].indexOf(th);
            let sortstate = this.dataset.sort;

            tableRows.sort((a, b) => {
                if (a.children[columnindex].dataset.value) {
                    if (sortstate == 'asc') {
                        th.dataset.sort = 'desc';
                        return parseFloat(b.children[columnindex].dataset.value) - parseFloat(a.children[columnindex].dataset.value);
                    } else {
                        th.dataset.sort = 'asc';
                        return parseFloat(a.children[columnindex].dataset.value) - parseFloat(b.children[columnindex].dataset.value);
                    }
                } else {
                    if (sortstate == 'asc') {
                        th.dataset.sort = 'desc';
                        return a.children[columnindex].dataset.name.localeCompare(b.children[columnindex].dataset.name);
                    } else {
                        th.dataset.sort = 'asc';
                        return b.children[columnindex].dataset.name.localeCompare(a.children[columnindex].dataset.name);
                    }
                }
            });

            for (let sortedrow of tableRows) {
                tbody.appendChild(sortedrow);
            }
        });
    };
};

const defaultSort = function() {
    let defaultSortColumn = 5;

    const table = document.getElementById('portstable');
    const tbody = table.querySelector('tbody');

    const tableRows = Array.from(tbody.querySelectorAll('tr'));

    tableRows.sort((a, b) => {
        if (a.dataset.fav == 'true' && b.dataset.fav == 'false') {
            return -1;
        } else if (b.dataset.fav == 'true' && a.dataset.fav == 'false') {
            return 1;
        }

        return parseFloat(b.children[defaultSortColumn].dataset.value) - parseFloat(a.children[defaultSortColumn].dataset.value);
    });

    for (let sortedrow of tableRows) {
        tbody.appendChild(sortedrow);
    }
};

window.onload = async () => {
    await portsResources();
    makeSortable();
    defaultSort();
};
