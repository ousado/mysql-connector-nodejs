/*
 * Copyright (c) 2015, 2017, Oracle and/or its affiliates. All rights reserved.
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
const query = require('./Query');
const result = require('./Result');
const tableOrdering = require('./TableOrdering');
const updating = require('./Updating');

const category = query.Type.TABLE;

/**
 * TableUpdate factory.
 * @module TableUpdate
 * @mixes Binding
 * @mixes Limiting
 * @mixes Query
 * @mixes TableOrdering
 * @mixes Updating
 */

/**
 * @private
 * @alias module:TableUpdate
 * @param {Session} session - session to bind
 * @param {string} schemaName - schema name
 * @param {string} tableName - table name
 * @param {string} criteria - criteria expression
 * @returns {TableUpdate}
 */
function TableUpdate (session, schemaName, tableName, criteria) {
    return Object.assign({}, binding({ category, criteria: criteria || '' }), limiting(), query({ category, schemaName, session, tableName }), tableOrdering(), updating(), {
        /**
         * Execute update query.
         * @function
         * @name module:TableUpdate#execute
         * @return {Promise.<Result>}
         */
        execute () {
            if (!this.getCriteria().trim().length) {
                return Promise.reject(new Error('A valid condition needs to be provided with `update()` or `where()`'));
            }

            return this.getSession()._client.crudModify(this).then(state => result(state));
        },

        /**
         * Retrieve the class name (to avoid duck typing).
         * @function
         * @name module:TableUpdate#getClassName
         * @returns {string} The "class" name.
         */
        getClassName () {
            return 'TableUpdate';
        },

        /**
         * Add a field to be updated with a new value.
         * @function
         * @name module:TableUpdate#set
         * @param {string} field - field name
         * @param {string} expr - value expression
         * @returns {TableUpdate} The query instance.
         */
        set (field, expr) {
            const operations = this.getOperations().concat({
                type: updating.Operation.SET,
                source: field,
                value: expr
            });

            return this.setOperations(operations);
        }
    });
}

module.exports = TableUpdate;
