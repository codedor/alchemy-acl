/**
 * Route Rule Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var RouteRule = Function.inherits('AclRuleType', function RouteAclRuleType() {
	RouteAclRuleType.super.call(this);
});

RouteRule.constitute(function addBlueprint() {
	this.blueprint.addField('url', 'RegExp');
});
