// https://github.com/theproductiveprogrammer/flipbook-viewer
// https://github.com/iberezansky/flip-book-jquery
import { FlipBookEdit, FlipBookView } from "./FlipBook";

import icon_sfogliatore from "@plone/volto/icons/file.svg";

const applyConfig = (config) => {
  config.blocks.blocksConfig.flipBook = {
    id: "flipBook",
    title: "Sfogliatore PDF",
    icon: icon_sfogliatore,
    group: "common",
    view: FlipBookView,
    edit: FlipBookEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default applyConfig;
