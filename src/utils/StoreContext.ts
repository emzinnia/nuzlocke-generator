import * as React from "react";
import * as PropTypes from "prop-types";

export function StoreContext(target: any) {
    target.contextTypes = target.contextTypes || {};
    target.contextTypes.store = PropTypes.object.isRequired;
}
