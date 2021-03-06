/*
 * Copyright (c) 2015, 2018, Oracle and/or its affiliates. All rights reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2.0, as
 * published by the Free Software Foundation.
 *
 * This program is also distributed with certain software (including
 * but not limited to OpenSSL) that is licensed under separate terms,
 * as designated in a particular file or component or in included license
 * documentation.  The authors of MySQL hereby grant you an
 * additional permission to link the program and your derivative works
 * with the separately licensed software that they have included with
 * MySQL.
 *
 * Without limiting anything contained in the foregoing, this file,
 * which is part of MySQL Connector/Node.js, is also subject to the
 * Universal FOSS Exception, version 1.0, a copy of which can be found at
 * http://oss.oracle.com/licenses/universal-foss-exception.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License, version 2.0, for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin St, Fifth Floor, Boston, MA 02110-1301  USA
 */

'use strict';

const binding = require('./Binding');
const limiting = require('./Limiting');
const collectionOrdering = require('./CollectionOrdering');
const query = require('./Query');
const result = require('./Result');
const updating = require('./Updating');

/**
 * CollectionModify factory.
 * @module CollectionModify
 * @mixes Binding
 * @mixes Limiting
 * @mixes CollectionOrdering
 * @mixes Query
 * @mixes Updating
 */

/**
 * @private
 * @alias module:CollectionModify
 * @param {Session} session - session to bind
 * @param {string} schema - schema name
 * @param {string} tableName - collection name
 * @param {string} [criteria] - filtering criteria expression
 * @returns {CollectionModify}
 */
function CollectionModify (session, schemaName, tableName, criteria) {
    return Object.assign({}, binding({ criteria: criteria || '' }), collectionOrdering(), limiting(), query({ schemaName, session, tableName }), updating(), {
        /**
         * Append element to an array field.
         * @function
         * @name module:CollectionModify#arrayAppend
         * @param {string} field - document array field
         * @param {*} any - value to append
         * @returns {CollectionModify} The query instance.
         */
        arrayAppend (field, any) {
            const operations = this.getOperations().concat({
                type: updating.Operation.ARRAY_APPEND,
                source: field,
                value: any
            });

            return this.setOperations(operations);
        },

        /**
         * Delete element from an array.
         * @function
         * @name module:CollectionModify#arrayDelete
         * @param {string} field - document array field
         * @returns {CollectionModify} The query instance.
         */
        arrayDelete (field) {
            const operations = this.getOperations().concat({
                type: updating.Operation.ITEM_REMOVE,
                source: field
            });

            return this.setOperations(operations);
        },

        /**
         * Insert element into an array field.
         * @function
         * @name module:CollectionModify#arrayInsert
         * @param {string} field - document array field
         * @param {*} any - value to insert
         * @returns {CollectionModify} The query instance.
         */
        arrayInsert (field, any) {
            const operations = this.getOperations().concat({
                type: updating.Operation.ARRAY_INSERT,
                source: field,
                value: any
            });

            return this.setOperations(operations);
        },

        /**
         * Execute modify operation.
         * @function
         * @name module:CollectionModify#execute
         * @return {Promise.<Result>}
         */
        execute () {
            if (!this.getCriteria().trim().length) {
                return Promise.reject(new Error('A valid condition needs to be provided with `modify()`'));
            }

            return this.getSession()._client.crudModify(this).then(state => result(state));
        },

        /**
         * Retrieve the class name (to avoid duck typing).
         * @function
         * @name module:CollectionModify#getClassName
         * @returns {string} The "class" name.
         */
        getClassName () {
            return 'CollectionModify';
        },

        /**
         * Update multiple document properties.
         * @function
         * @name module:CollectionModify#patch
         * @param {Object} properties - properties to update
         * @return {CollectionModify} The query instance.
         */
        patch (properties) {
            const operations = this.getOperations().concat({
                source: '$',
                type: updating.Operation.MERGE_PATCH,
                value: properties
            });

            return this.setOperations(operations);
        },

        /**
         * Set the value of a given document field.
         * @function
         * @name module:CollectionModify#set
         * @param {string} field - document field
         * @param {*} any -  value to assign
         * @returns {CollectionModify} The query instance.
         */
        set (field, any) {
            const operations = this.getOperations().concat({
                type: updating.Operation.ITEM_SET,
                source: field,
                value: any
            });

            return this.setOperations(operations);
        },

        /**
         * Unset the value of document fields.
         * @function
         * @name module:CollectionModify#unset
         * @param {Array.<String>|String} fields
         * @returns {CollectionModify} The query instance.
         */
        unset (fields) {
            const operations = this.getOperations().concat([].concat(fields).map(field => ({
                type: updating.Operation.ITEM_REMOVE,
                source: field
            })));

            return this.setOperations(operations);
        }
    });
}

module.exports = CollectionModify;
