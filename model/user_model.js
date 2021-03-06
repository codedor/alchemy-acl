var bcrypt = alchemy.use('bcrypt');

// Don't load this file if a user model already exists
if (alchemy.classes.UserModel) {
	return;
}

/**
 * The User Model class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var User = Model.extend(function UserModel(options) {

	UserModel.super.call(this, options);

	this.on('saving', function beforeSave(data, options, creating) {

		var next;

		if (!data.password) {
			return;
		}

		next = this.wait();

		bcrypt.hash(data.password, 8, function gotHash(err, hash) {

			if (err != null) {
				return next(err);
			}

			pr('Hash: ' + hash);

			data.password = hash;
			next();
		});
	});
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    1.0.0
 * @version  1.0.0
 */
User.constitute(function addFields() {

	var field,
	    i;

	this.addField('username', 'String');
	this.addField('password', 'Password');

	for (i = 0; i < alchemy.plugins.acl.userModelFields.length; i++) {
		field = alchemy.plugins.acl.userModelFields[i];

		this.addField.apply(this, field);
	}

	this.hasAndBelongsToMany('AclGroup');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
User.constitute(function chimeraConfig() {

	var field,
	    list,
	    edit,
	    view,
	    i;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('username');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('username');
	edit.addField('password');
	edit.addField('acl_group_id');

	for (i = 0; i < alchemy.plugins.acl.userModelFields.length; i++) {
		field = alchemy.plugins.acl.userModelFields[i];
		edit.addField(field[0]);
	}

	// Get the view group
	view = this.chimera.getActionFields('view');

	view.addField('username');

	for (i = 0; i < alchemy.plugins.acl.userModelFields.length; i++) {
		field = alchemy.plugins.acl.userModelFields[i];
		view.addField(field[0]);
	}
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {String}   existing   The existing session to remove
 * @param    {Function} callback
 */
User.setDocumentMethod(function createPersistentCookie(existing, callback) {

	var Persistent,
	    that = this;

	if (typeof existing == 'function') {
		callback = existing;
		existing = null;
	}

	Persistent = Model.get('AclPersistentCookie');

	Function.parallel(function session(next) {
		Crypto.randomHex(16, next);
	}, function token(next) {
		Crypto.randomHex(16, next);
	}, function done(err, result) {

		var data;

		if (err) {
			return callback(err);
		}

		data = {
			identifier: result[0],
			token: result[1],
			user_id: that._id
		};

		Persistent.save(data, function saved(err) {

			if (err) {
				return callback(err);
			}

			callback(null, data);
		});
	});
});

return;

(function(){

	/**
	 * The preInit constructor
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.0.1
	 * @version  0.0.1
	 */
	this.preInit = function preInit() {

		this.parent();

		this.displayField = 'username';
		
		this.hasOneChild = {
			NotificationSetting: {
				modelName: 'NotificationSetting',
				foreignKey: 'user_id'
			}
		};

		this.hasAndBelongsToMany = {
			AclGroup: {
				modelName: 'AclGroup',
				foreignKey: 'acl_group_id'
			}
		};
		
		this.blueprint = {
			username: {
				type: 'String',
				index: {
					unique: true,
					name: 'username',
					sparse: false,
					order: 'asc'
				}
			},
			name: {
				type: 'String',
				rules: {
					notempty: {message: 'This field should not be empty!'}
				}
			},
			password: {
				type: 'Password',
				rules: {
					notempty: {
						mesage: 'A password is required!'
					}
				}
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: [
					'username',
					'name',
					'password',
					'acl_group_id'
				]
			}
		};

		this.modelIndex = {
			fields: [
				'created',
				'username',
				'name',
				'acl_group_id'
			]
		};

		this.actionLists = {
			paginate: ['index', 'add'],
			list: ['export'],
			record: [
				'view',
				'edit',
				'remove'
			]
		};
	};
});