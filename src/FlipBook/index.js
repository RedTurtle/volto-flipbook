// export FlipBookView from './FlipBookView';
// export FlipBookEdit from './FlipBookEdit';

import loadable from "@loadable/component";

const FlipBookView = loadable(() => import(/* webpackChunkName: "FlipBookView" */ "./FlipBookView"));
const FlipBookEdit = loadable(() => import(/* webpackChunkName: "FlipBookEdit" */ "./FlipBookEdit"));

export { FlipBookEdit, FlipBookView };
