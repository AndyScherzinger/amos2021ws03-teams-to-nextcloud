import FileWrapper from "../../file-wrapper/file-wrapper";
import moment from 'moment'

const state = {
    path: [],
    children: [],
    lastSelectedChild: null,
};

const getters = {
    /**
     * Return the current path
     */
    StatePath: function (state) {
        return state.path;
    },

    /**
     * Return the children of the last item of the current path
     */
    StateChildren: function (state) {
        return state.children;
    },

    StateSelectedChildren: function (state) {
        return state.children.filter(child => child.selected);
    },
    /**
     * Return the child that was selected the most recently, it should be an object in the format { index: Number, child: Object }
     */
    StateLastSelectedChild: function(state){
        return state.lastSelectedChild
    }
};

const actions = {
    /**
     * Checks if the current path is empty and if it is, adds the root directory to the path.
     */
    initPath({ commit, getters }) {
        let path = getters.StatePath;
        if (Array.isArray(path) && path.length == 0) {
            var username = getters.StateUsername;
            let rootName = "Documents"
            let rootPath = "/files/" + username + "/"
            let rootDir = new FileWrapper(rootName, rootPath, true, false, "");
            commit("pushToPath", rootDir);
        }
    },

    /**
     * Loads the children of the last directory in the current path.
     */
    async loadChildrenForPath({ commit, getters }) {
        let path = getters.StatePath;
        if (Array.isArray(path) && path.length) {
            // Get the last directory of the current path
            let lastDirectory = path[path.length - 1];
            // Call the API through the API and get the directory contents
            let client = getters.StateWebdavClient;
            let children = await client.getDirectoryContents(lastDirectory.path);
            // Map the contents to FileWrapper objects
            children = children.map(file => {
                // Parse the UTC date, so that it looks better
                let now = moment(new Date()); //todays date
                let lastmod = moment(file.lastmod); // last modified date
                let duration = moment.duration(now.diff(lastmod));
                let days = duration.asDays();
                let hours = duration.asHours();
                let lastModified = "";
                if(hours <= 24) {
                    lastModified = lastmod.fromNow(); // 3 hours ago, an hour ago
                } else if(days <= 7) {
                    lastModified = lastmod.calendar(); // Yesterday at 2:57 AM, Wednesday at 2:58 AM
                } else {
                    lastModified = lastmod.format('LL'); // November 28, 2021
                }
                return new FileWrapper(file.basename, file.filename, file.type == "directory", file.type == "file", lastModified);
            });

            children.sort(function (a, b) {
                // If the files are of the same type
                if (a.directory == b.directory) {
                    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                      return -1;
                    }
                    if (nameA > nameB) {
                      return 1;
                    }
                    // names must be equal
                    return 0;
                } 
                // Elements have differnet type -> Directories should come first
                else {
                    if(a.directory && b.file) {
                        return -1;
                    }
                    if(a.file && b.directory) {
                        return 1;
                    }
                    return 0;
                }
            });

            // Save the new children
            commit("setChildren", children);
        }
    },

    setFileSelected({ getters, commit }, data) {
        let path = data.path;
        let selected = data.selected;
        getters.StateChildren.forEach((child, index) => {
            if (child.path == path) {
                commit('setSelectStateOfChild', { selected, index});
                commit('setLastSelectedChild', { index, child });
            }
        });
    },

    setAllFilesUnselected({ getters, commit }) {
        getters.StateChildren.forEach((_, index) =>{
            commit('setSelectStateOfChild', { selected: false, index});
        });
        commit('setLastSelectedChild', null);
    },

    async rename({ getters, dispatch }, paths) {
        try {
            await getters.StateWebdavClient.moveFile(paths.currentPath, paths.newPath);
        } catch (e) {
            console.error(e);
        }
        await dispatch('loadChildrenForPath');
    },

    async createFolder({ getters, dispatch }, path) {
        try {
            await getters.StateWebdavClient.createDirectory(path);
        } catch (e) {
            console.error(e);
        }
        await dispatch('loadChildrenForPath');
    },

    /**
     * Select the whole range between lastSelectedChild and the file that was clicked on
     */
    selectRange({ getters, commit, dispatch }, { child }){
      let children = getters.StateChildren;
      let lastSelection = getters.StateLastSelectedChild;
      let idxSelection = children.map(c => c.path).indexOf(child.path)
      if(idxSelection !== -1){
          let startIdx = lastSelection.index > idxSelection ? idxSelection : lastSelection.index;
          let stopIdx = lastSelection.index > idxSelection ? lastSelection.index : idxSelection;
          let direction = startIdx - stopIdx < 0 ? 1: -1;
          dispatch('setAllFilesUnselected');
          for(let i = startIdx; i <= stopIdx; i = i + direction){
            commit('setSelectStateOfChild', { selected: true, index: i});
          }
          commit('setLastSelectedChild', { index: stopIdx, child: children[stopIdx] });
      }
    },
    /**
     * Move the selection to the next child in the list or the previous child in the list
     * direction should be either "next" or "previous"
     */
    moveSelection({ getters, commit, dispatch }, { direction, holdShift }){
        let lastSelection = getters.StateLastSelectedChild;
        if(lastSelection === null){
            return;
        }
        let children = getters.StateChildren;
        let currentIndex = lastSelection.index;
        let nextIndex = direction === "next" ? currentIndex+1 : currentIndex-1;
        // don't do anything when the next selection would go outside the range
        if(nextIndex < 0 || nextIndex >= children.length ){
            return;
        }
        if(!holdShift){
            dispatch('setAllFilesUnselected');
        }
        let nextSelection = children[nextIndex];
        // when holding shift the last selection doesn't get cleared 
        // but when going back to the previous selection while holding shift it should deselect the last selection
        commit('setSelectStateOfChild', { selected: holdShift && !nextSelection.selected , index: currentIndex });
        commit('setSelectStateOfChild', { selected: true, index: nextIndex});
        commit('setLastSelectedChild', { index: nextIndex, child: nextSelection});
    }
};

const mutations = {
    /**
     * Pushes a directory at the end of the path
     */
    pushToPath(state, file) {
        state.path.push(file);
    },

    /**
     * Removes every element of the path from the index till the end 
     */
    splicePath(state, index) {
        state.path.splice(index);
    },

    /**
     * Updates the current children variable
     */
    setChildren(state, children) {
        state.children = children;
    },
    /**
     * Set the last selected child 
     */
    setLastSelectedChild(state, payload){
        state.lastSelectedChild = payload;
    },
    /**
     * Set the selection state of the child at the provided index
     */
    setSelectStateOfChild(state, { selected, index }){
        state.children[index].selected = selected;
    },

    /**
     * modify the child at the provided index
     */
    setChildAt( state, { child, index }){
        state.children[index] = child;
    }

};

export default {
    state,
    getters,
    actions,
    mutations
};
