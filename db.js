"use strict";

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('app.db');

function getAllRows(table) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT rowid AS id, * FROM ${table}`, function(err, rows) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(rows)
            }
        });
    })
}

function getRunData(data, template, prefix = "") {
    let _set = prefix;
    let _data = {};
    for (let name in data) {
        _set += `${_set.length > prefix.length ? ',' :''} ${template(name, data[name])}`;  
        _data[`$${name}`] = data[name]; 
    }
    return {
        str: _set,
        data: _data
    }
}

function getItemById(table, id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT rowid AS id, * FROM ${table} WHERE rowid = ${id}`, function(err, row) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (row.length === 1) {
                    resolve(row[0])
                } else {
                    reject();
                }
            }
        });
    })
}

function updateItemById(table, id, data) {
    let run = getRunData(data, (name) => `${name} = $${name}`, "SET");
    return new Promise((resolve, reject) => {
        db.run(`UPDATE ${table} ${run.str} WHERE rowid = ${id}`, run.data, function(err, row) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                
                resolve(id);
            }
        });
    })
}

function insertItem(table, data) {
    let run = getRunData(data, (name) => `${name}`);
    let runValues = getRunData(data, (name) => `$${name}`);
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO ${table} (${run.str}) VALUES (${runValues.str})`, run.data, function(err, row) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                db.run('SELECT last_insert_rowid()', function(err, rid) {
                    resolve(this.lastID);
                });  
            }
        });
    })
}

function deleteItemById(table, id) {
    return new Promise((resolve, reject) => {
        db.all(`DELETE FROM ${table} WHERE rowid = ${id}`, function(err, row) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve()
            }
        });
    })
}

module.exports = {
    getAll:  () => {
        return Promise.all([
            getAllRows('Locations'),
            getAllRows('Transitions'),
            getAllRows('Paths'),
            getAllRows('Questions')
        ]);
    },
    getAllLocations: () => {
        return getAllRows('Locations');
    },
    getLocation: (id) => {
        return getItemById('Locations', id);
    },
    updateLocation: (id, name, description, excursion) => {
        return updateItemById('Locations', id, {
            name: name, 
            description: description,
            excursion: excursion
        });
    },
    newLocation: (name, description) => {
        return insertItem('Locations', {
            name: name, 
            description: description,
            excursion: '[]'
        });
    },
    deleteLocation: (id) => {
        return deleteItemById('Locations', id);
    },
    
    getAllTransitions: () => {
        return getAllRows('Transitions');
    },
    getTransition: (id) => {
        return getItemById('Transitions', id);
    },
    updateTransition: (id, locationId1, locationId2, xyz1, xyz2) => {
        return updateItemById('Transitions', id, {
            locationId1: locationId1, 
            locationId2: locationId2, 
            xyz1: xyz1,
            xyz2: xyz2
        });
    },
    newTransition: (locationId1, locationId2, xyz1, xyz2) => {
        return insertItem('Transitions', {
            locationId1: locationId1, 
            locationId2: locationId2, 
            xyz1: xyz1,
            xyz2: xyz2
        });
    },
    deleteTransition: (id) => {
        return deleteItemById('Transitions', id);
    },
    
    
    getAllPaths: () => {
        return getAllRows('Paths');
    },
    getPath: (id) => {
        return getItemById('Paths', id);
    },
    updatePath: (id, name, path) => {
        return updateItemById('Paths', id, {
            name: name, 
            path: path,
        });
    },
    newPath: (name, path) => {
        return insertItem('Paths', {
            name: name, 
            path: path,
        });
    },
    deletePath: (id) => {
        return deleteItemById('Paths', id);
    },
    
    getAllQuestions: () => {
        return getAllRows('Questions');
    },
    getQuestion: (id) => {
        return getItemById('Questions', id);
    },
    updateQuestion: (id, text, data) => {
        return updateItemById('Questions', id, {
            text: text,
            data: data
        });
    },
    newQuestion: (text, data) => {
        return insertItem('Questions', {
            text: text,
            data: data
        });
    },
    deleteQuestion: (id) => {
        return deleteItemById('Questions', id);
    },
    
    like: (value) => {
        return insertItem('Likes', {
            value: value
        });
    },
    
    getLikes: () => {
        return getAllRows('Likes');
    },
};