//const $ = require("jquery");
const viewer = new PANOLENS.Viewer({ controlBar: false });
const data = $('#data').data('data');
const panorames = {};
for (let location of data.locations) {
    panorames[location.id] = {
        panorama: new PANOLENS.ImagePanorama(`/images/panorames/${location.id}.jpg`),
        excursion: []
    }
    for (let excursionNode of JSON.parse(location.excursion)) {
        const point = {
            infospot: new PANOLENS.Infospot(350, PANOLENS.DataImage.Info),
            text: excursionNode.text
        }
        point.infospot.position.set(...excursionNode.position);
        point.infospot.addHoverText(excursionNode.text);
        panorames[location.id].panorama.add(point.infospot);
        panorames[location.id].excursion.push(point);
    }
    viewer.add(panorames[location.id].panorama);
}
for (let transition of data.transitions) {
    panorames[transition.locationId1].panorama.link(panorames[transition.locationId2].panorama, new THREE.Vector3(...JSON.parse(transition.xyz1)));
    panorames[transition.locationId2].panorama.link(panorames[transition.locationId1].panorama, new THREE.Vector3(...JSON.parse(transition.xyz2)));
}

//
//$( window ).on('hashchange', function( e ) {
//    let id = location.hash.substr(1);
//    viewer.setPanorama(panorames[id].data);
//    
//});

let index = 0;
let result = []
let ip = 0
var typed;

function getItemById(arr, id) {
    for (let item of arr) {
        if (item.id == id) {
            return item;
        }
    }
    return null;
}

function type(stringArray, onComplete, startDelay = 1000) {

    onComplete = onComplete || function () {};


    typed = new Typed("#typed", {
        strings: stringArray,
        typeSpeed: 50,
        showCursor: false,
        startDelay: startDelay,
        onComplete: onComplete
    });

}

function playExcursion(excursion, onEnd) {
    let index = 0;
    const show = () => {
        if (index < excursion.length) {
            excursion[index].infospot.focus();
            type([
                "",
                excursion[index].text

            ], () => {
                setTimeout(() => {
                    type(["", ""], () => {
                        index += 1;
                        show();
                    });
                }, 1500)
            })
        } else {
            $('#typed').html('')
            onEnd();
        }
    }
    show();
}

function playLocation(location, onEnd) {
    viewer.setPanorama(location.panorama);
    if (location.excursion.length) {
        playExcursion(location.excursion, () => {
            onEnd();
        })
    } else {
        const updateCallback = () => {
            location.panorama.rotation.y += 0.004;
        }
        viewer.addUpdateCallback(updateCallback);
        setTimeout(() => {
            viewer.removeUpdateCallback(updateCallback);
            onEnd()
        }, 20000)
    }
}

function play(a, p = 0) {
    ip = p;
    if (p + 1 <= a.length) {
        playLocation(panorames[a[p]], () => {
            if (p + 1 < a.length) {
                play(a, p + 1);
            } else {
                $('.dialog').show();
                viewer.OrbitControls.enabled = true;
            }
        })

    }
}

function showExcursion(excursion) {
    let path = [];
    for (let id of excursion) {
        path = path.concat(JSON.parse(getItemById(data.paths, id).path));
    }
    play(path);
    viewer.OrbitControls.enabled = false;
}
try {
    showExcursion(JSON.parse(data.excursion));
} catch (e) {
    type(["", ""])
}

$('.js-like').click(() => {
    $('.dialog').hide()
    $.get(`/api/like?value=${$('input:checked')[0].value}`);
})

$('.js-repeat').click(() => {
    location.reload();
})

$('.js-new-excursion').click(() => {
    location.href = '/';
})

