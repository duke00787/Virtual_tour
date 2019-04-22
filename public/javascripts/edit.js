function post(url, data, files = []) {
    return new Promise((resolve, reject) => {
        const xrs = new XMLHttpRequest();
        const fd = new FormData();
        for (let name in data) {
            fd.append(name, data[name]);
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Check the file type.
            if (!file.type.match('image.*')) {
                continue;
            }

            // Add the file to the request.
            fd.append('photos[]', file, file.name);
        }
        xrs.open('POST', url);
        xrs.onload = () => {
            resolve(JSON.parse(xrs.responseText));
        }
        xrs.send(fd);
    })
}
const getItemByID = (id, arr) => {
    for (let i of arr) {
        if (i.id == id) {
            return i;
        }
    }
    return null;
}
const API = {
    edit: {
        location: (name, excursion, description = '', img, id) => {
            return post('/api/edit/location', {
                name: name,
                description: description,
                excursion: excursion,
                id: id
            }, img)
        },
        transition: (l1, l2, c1, c2, id) => {
            return post('/api/edit/transition', {
                lId1: l1,
                lId2: l2,
                c1: c1,
                c2: c2,
                id: id
            })
        },
        path: (name, path, id) => {
            return post('/api/edit/path', {
                name: name,
                path: path,
                id: id
            })
        },
        question: (text, data, id) => {
            return post('/api/edit/question', {
                text: text,
                data: data,
                id: id
            })
        },
    },
    remove: {
        location: (id) => {
            return post('/api/remove/location', {
                id: id
            }, img)
        },
        transition: (id) => {
            return post('/api/remove/transition', {
                id: id
            })
        },
        path: (id) => {
            return post('/api/remove/path', {
                id: id
            })
        },
        question: (id) => {
            return post('/api/remove/question', {
                id: id
            })
        },
    }
}


$('.js-edit-transition').click(function () {
    const id = $(this).data('id');
    const l1 = $("#l1").val();
    const l2 = $("#l2").val();
    const c1 = $("#c1").val();
    const c2 = $("#c2").val();
    if (!l1.length || !l2.length || !c1.length || !c2.length) {
        $.notify("Ошибка: все поля обязательны!!!", "error");
    } else {
        API.edit.transition(l1, l2, c1, c2, id).then(data => {
            if (data.status === 200) {
                $.notify("Изменения успешно сохранены", "success");
            } else {
                $.notify("Ошибка", "error");
            }
        })
    }
})

$('.js-edit-path').click(function () {
    const id = $(this).data('id');
    const name = $("#name").val();
    const path = $("#path").val();
    API.edit.path(name, path, id).then(data => {
        if (data.status === 200) {
            $.notify("Изменения успешно сохранены", "success");
        } else {
            $.notify("Ошибка", "error");
        }
    })
})

$('.js-edit-question').click(function () {
    const id = $(this).data('id');
    const text = $("#text").val();
    const data = $("#data").val();
    API.edit.question(text, data, id).then(data => {
        if (data.status === 200) {
            $.notify("Изменения успешно сохранены", "success");
        } else {
            $.notify("Ошибка", "error");
        }
    })
})

$('.js-remove').click(function () {
    const $this = $(this);
    const $item = $this.parent().parent();
    API.remove[$this.data('type')]($this.data('id')).then(data => {
        if (data.status === 200) {
            $.notify("Запись удалена", "success");
            $item.remove();
        } else {
            $.notify("Ошибка", "error");
        }
    })
})

const $pathEditor = $(".js-path-editor");
const $questionEditor = $(".js-question-editor");
const $transitionEditor = $(".js-transition-editor");
const $locationEditor = $(".js-location-editor");

if ($pathEditor.length) {
    const $path = $('#path');
    const $name = $('#name');
    const $location = $('#location');
    const locations = $location.data('locations');
    const append = (id, name) => {
        $(".js-path-editor").append(`
<li class="js-path-node" data-id="${id}"><span>${name}</span><a class="js-path-node-remove" href="#">удалить</a></li>
`);
    }
    if ($path.val().length) {
        const path = JSON.parse($path.val())
        for (let node of path) {
            const l = getItemByID(node, locations);
            append(l.id, l.name);
        }
    }

    const getTextValue = () => {
        const nodes = $('.js-path-node');
        const result = [];
        for (let n of nodes) {
            result.push($(n).data('id'))
        }
        return JSON.stringify(result);
    }
    $pathEditor.find('.js-path-node-add').click(() => {
        const l = getItemByID($location.val(), locations);
        append(l.id, l.name);
        $path.val(getTextValue());
    })
    $pathEditor.on('click', '.js-path-node-remove', function () {
        $(this).parent().remove();
        $path.val(getTextValue());
    })
}

if ($questionEditor.length) {
    const $data = $('#data');
    const $paths = $('#paths');
    const $ans =

        $("#ans");
    const paths = $paths.data('paths');

    const append = (id, name, ans) => {
        $questionEditor.append(`
<li class="js-question-node" data-id="${id}" data-text="${ans}"><span>${ans}</span><span>${name}</span><a class="js-question-node-remove" href="#">удалить</a></li>
`);
    }

    if ($data.val().length) {
        const data = JSON.parse($data.val())
        for (let node of data) {
            const p = getItemByID(node.path, paths);
            append(p.id, p.name, node.ans);
        }
    }
    const getTextValue = () => {
        const nodes = $('.js-question-node');
        const result = [];
        for (let n of nodes) {
            result.push({
                ans: $(n).data('text'),
                path: $(n).data('id')
            })
        }
        return JSON.stringify(result);
    }
    $questionEditor.find('.js-question-node-add').click(() => {
        const p = getItemByID($paths.val(), paths);
        append(p.id, p.name, $ans.val());
        $ans.val('')
        $data.val(getTextValue());
    })
    $questionEditor.on('click', '.js-question-node-remove', function () {
        $(this).parent().remove();
        $path.val(getTextValue());
    })
}

class PointEditor {
    constructor($contaner, config = undefined) {
        this.localPointIdCounter = 0;
        this.$contaner = $contaner;
        this.zoom = 5000;
        this.selectedPanorameId = -1;
        this.selectedPointId = -1;
        this.panorames = {}
        this.editStarted = false;
        this.viewer = new PANOLENS.Viewer({
            container: $contaner[0]
        });
        this.change = () => {};
        this.initMoutionControl();
        if (config) {
            this.init(config);
        }
        //        setInterval(() => {
        //            this.updateInforspot();
        //            $input.val(JSON.stringify(this.xyz))
        //        }, 200)
    }

    init(config) {
        for (let imageId in config) {
            this.setPanorame(imageId);
            for (let point of config[imageId]) {
                this.setPoint(point.position, point.text);
            }
        }
    }

    initMoutionControl() {
        this.$contaner.mousedown(() => {
            this.editStarted = this.selectedPanorameId != -1 && this.selectedPointId != -1;
        });
        $(window).mouseup(() => {
            this.editStarted = false;
        })
        $(window).mousemove(() => {
            if (this.editStarted) {
                this.setPoint(this.getCamerPointPosition(), this.selectedPointId);
            }
        })
    }

    setPanorame(imageId) {
        if (this.panorames[imageId]) {
            this.selectedPanorameId = imageId;
            this.viewer.setPanorama(this.panorames[imageId].panorama);
            const keys = Object.keys(this.panorames[imageId].points);
            if (keys.length) {
                this.panorames[imageId].points[keys[0]].infospot.focus();
                this.selectedPointId = keys[0];
            }

        } else {
            this.panorames[imageId] = {
                panorama: new PANOLENS.ImagePanorama(`/images/panorames/${imageId}.jpg`),
                points: {}
            }
            this.viewer.add(this.panorames[imageId].panorama);
            this.viewer.setPanorama(this.panorames[imageId].panorama);
        }
        this.selectedPanorameId = imageId;
    }

    setPoint(position, id = -1, text = undefined) {
        let resultId = id;
        if (id === -1) {
            resultId = this.localPointIdCounter;
            this.localPointIdCounter += 1;
            const point = {
                infospot: new PANOLENS.Infospot(350, PANOLENS.DataImage.Info)
            }
            this.panorames[this.selectedPanorameId].panorama.add(point.infospot)
            this.panorames[this.selectedPanorameId].points[resultId] = point;
        }
        this.panorames[this.selectedPanorameId].points[resultId].position = position;
        if (text != undefined) {
            this.panorames[this.selectedPanorameId].points[resultId].text = text;
            this.panorames[this.selectedPanorameId].points[resultId].infospot.addHoverText(text);
        }

        this.panorames[this.selectedPanorameId].points[resultId].infospot.position.set(...position);
        this.panorames[this.selectedPanorameId].points[resultId].infospot.focus();
        this.selectedPointId = resultId;
        this.change(this.selectedPanorameId, this.getPointSet(this.selectedPanorameId));
        return resultId;
    }

    getCamerPointPosition() {
        return [
            this.viewer.camera.position.x * this.zoom,
            this.viewer.camera.position.y * this.zoom * -1,
            this.viewer.camera.position.z * this.zoom * -1
        ]
    }

    getPointSet(panorameId) {
        const result = {};
        for (let id in this.panorames[panorameId].points) {
            const point = this.panorames[panorameId].points[id];
            result[id] = {
                position: point.position,
                text: point.text
            };
        }
        return result;
    }

    onPointsetChange(f) {
        this.change = f;
    }
    
    removePoint(id) {
        this.panorames[this.selectedPanorameId].panorama.remove(this.panorames[this.selectedPanorameId].points[id].infospot);
        this.panorames[this.selectedPanorameId].points[id] = undefined;
    }
}

if ($transitionEditor.length) {
    const config = {};
    const $l1 = $('#l1');
    const $l2 = $('#l2');
    if ($('#c1').val().length) {
        config[$l1.val()] = [
            {
                position: JSON.parse($('#c1').val())
            }
        ];
    }
    if ($('#c2').val().length) {
        config[$l2.val()] = [
            {
                position: JSON.parse($('#c2').val())
            }
        ]
    }
    const editor = new PointEditor($('#editor'), config);
    const $location = $('#location');
    $location.change(function () {
        editor.setPanorame($location.val() == 0 ? $l1.val() : $l2.val());
    });
    $l1.change(function () {
        editor.setPanorame($l1.val());
        editor.setPoint(editor.getCamerPointPosition());
        $location.val(0);
    });
    $l2.change(function () {
        editor.setPanorame($l2.val());
        editor.setPoint(editor.getCamerPointPosition());
        $location.val(1);
    });
    editor.onPointsetChange((locationId, pontSet) => {
        if (locationId == $l1.val()) {
            $('#c1').val(JSON.stringify(Object.values(pontSet)[0].position))
        }
        if (locationId == $l2.val()) {
            $('#c2').val(JSON.stringify(Object.values(pontSet)[0].position))
        }
    })
}

class Excursion {
    constructor($editor, $selector) {
        const context = this;
        this.data = {};
        this.sort = [];

        this.$nodeList = $selector.find('.js-node-list');
        this.$newNode = $selector.find('.js-new-node');
        this.$newText = $selector.find('#new-node-text');

        this.$newNode.click(() => {
            if (this.$newText.val().length) {
                this.addNode(this.$newText.val());
                this.$newText.val(''); 
            } else {
                $.notify("Ошибка: нельзя добавить пустую запись", "error");
            }
        })

        const config = {};
        config[$editor.data('location')] = [];
        this.editor = new PointEditor($editor, config);
        this.editor.onPointsetChange((imageId, pointSet) => {
            for (let id in pointSet) {
                if (this.data[id]) {
                    this.data[id] = pointSet[id];
                }
            }
        });
        this.$nodeList.on('input', '.text-input', function() {
            const $this = $(this);
            const id = $this.parent().data('id');
            context.data[id].text = $this.val();
            context.editor.setPoint(context.data[id].position, id, $this.val());
        })
        this.$nodeList.on('click', '.js-delete', function() {
            const $this = $(this);
            const $node = $this.parent();
            const id = $node.data('id');
            $node.remove();
            context.data[id] = undefined;
            context.sort.splice(context.sort.indexOf(id), 1);
            context.editor.removePoint(id);
        })
        
        this.$nodeList.on('click', 'li:not(.selected)', function() {
            const $this = $(this);
            const id = $this.data('id');
            context.$nodeList.find('.selected').removeClass('selected');
            $this.addClass('selected');
            context.editor.setPoint(context.data[id].position, id);
        })
        
        this.$nodeList.sortable({
            update: () => { 
                const $sort = this.$nodeList.find('li');
                const sort = [];
                for (let node of $sort) {
                    sort.push($(node).data('id'));
                }
                this.sort = sort;
            }
        });
    }

    nodeRender(id, text) {
        return `<li data-id="${id}" class="selected">
                    <i class="fas fa-angle-right"></i>
                    <input type="text" class="text-input" value="${text}"/>
                    <i class="fas fa-trash js-delete"></i>
                </li>`;
    }

    addNode(text, position = [4000, 4000, 4000]) {
        const id = this.editor.setPoint(position, -1, text);
        this.data[id] = {
            position: position,
            text: text
        }
        this.sort.push(id);
        this.$nodeList.find('.selected').removeClass('selected');
        this.$nodeList.append(this.nodeRender(id, text))
    }
    
    toString() {
        const result = [];
        for (let id of this.sort) {
            result.push(this.data[id]);
        }
        return JSON.stringify(result);
    }
    
    addList(nodeList) {
        for (let node of nodeList) {
            this.addNode(node.text, node.position);
        }
    }

}

if ($locationEditor.length) {
    let excursion = new Excursion($('#editor-position'), $('#editor-sort'));
    excursion.addList($('#editor-position').data('excursion'))
    $('.js-edit-location').click(function () {
        const id = $(this).data('id');
        const description = $('#description').val();
        const name = $('#name').val();
        if (!name.length) {
            $.notify("Ошибка: имя панорамы не может быть пустым", "error");
        } else {
            API.edit.location(name, excursion.toString(), description, undefined, id).then(data => {
                if (data.status === 200) {
                    $.notify("Изменения успешно сохранены", "success");
                } else {
                    $.notify("Ошибка", "error");
                }
            });
        }
    });

} else {
    $('.js-edit-location').click(function () {
        const description = $('#description').val();
        const name = $('#name').val();
        const img = $('#img')[0].files;
        if (!name.length || img.length !== 1) {
            $.notify("Ошибка: введите имя и добавьте изображение панорамы", "error");
        } else {
            API.edit.location(name, '[]', description, img).then(data => {
                if (data.status === 200) {
                    $.notify("Изменения успешно сохранены", "success");
                } else {
                    $.notify("Ошибка", "error");
                }
            });
        }

    });
}
