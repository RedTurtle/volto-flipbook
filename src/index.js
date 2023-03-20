// https://github.com/theproductiveprogrammer/flipbook-viewer
// https://github.com/iberezansky/flip-book-jquery
import { FlipBookEdit, FlipBookView } from './FlipBook';

import pdf_icon from './FlipBook/file-pdf-regular.svg';

const applyConfig = (config) => {
  config.blocks.blocksConfig.flipBook = {
    id: 'flipBook',
    title: 'FlipBook',
    icon: pdf_icon,
    group: 'common',
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
