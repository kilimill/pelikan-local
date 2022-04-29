import {
    TYPE_IP_CAMERAS,
    TYPE_WEB_CAMERAS,
    STATUS_PENDING,
    STATUS_ACTIVE,
    STATUS_PAUSED,
    STATUS_FINISHED,
} from '@/store/modules/room/roomStatuses';
import roomApi from '@/api/room';
import settings from './settings';
import users from './users';
import presentations from './presentations';
import streams from './streams';

import content from "./content"
import boards from "./boards";
import materials from "./materials";
import { assign } from 'lodash';

/** @type {import('vuex/types').Module} */
export default {
    namespaced: true,
    modules: {settings, users, presentations, streams, content, boards, materials},
    state: () => ({
        id: undefined,
        timeCreated: undefined,
        timeEnd: undefined,
        typeId: undefined,
        statusId: undefined,
        janusPin: undefined,
    }),

    getters: {
        getEndDate: state => new Date(state.timeEnd),
        currentRoom: state => ({
            id: state.id,
            isWebCamRoom: state.typeId === TYPE_WEB_CAMERAS,
            isIpCamRoom: state.typeId === TYPE_IP_CAMERAS,
            isPending: state.statusId === STATUS_PENDING,
            isActive: state.statusId === STATUS_ACTIVE,
            isPaused: state.statusId === STATUS_PAUSED,
            isFinished: state.statusId === STATUS_FINISHED,
            timeEnd: state.timeEnd,
            statusId: state.statusId,
            typeId: state.typeId,
            settings: state.settings,
        }),
        roomStatusId(state) {
            return state.statusId;
        },
    },

    actions: {
        lowerAllHands({state}) {
            roomApi.setRoom(state.id).lowerRaisedHands()
                .catch(e => console.error(e));
        },
        initModule: {
            root: true,
            handler: (content, {currentRoom}) => content.commit("hydrate", currentRoom)
        },
        eventEventStart: {
            root: true,
            handler: ({commit}) => {
                return commit('setStatusId', STATUS_ACTIVE);
            },
        },
        eventEventPause: {
            root: true,
            handler: ({commit}) => {
                return commit('setStatusId', STATUS_PAUSED);
            },
        },
        eventEventResume: {
            root: true,
            handler: ({commit}) => {
                return commit('setStatusId', STATUS_ACTIVE);
            },
        },
        eventEventFinish: {
            root: true,
            handler: ({commit}) => {
                return commit('setStatusId', STATUS_FINISHED);
            },
        },
    },
    mutations: {
        setStatusId(state, payload) {
            state.statusId = payload;
        },

        hydrate(state, payload) {
            assign(state, payload)
        }
    }

};