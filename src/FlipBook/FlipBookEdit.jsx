import { Button, Dimmer, Input, Loader, Message } from 'semantic-ui-react';
import { Icon, SidebarPortal } from '@plone/volto/components';
import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import {
  flattenToAppURL,
  getBaseUrl,
  withBlockExtensions,
} from '@plone/volto/helpers';

import FlipBookSidebar from './FlipBookSidebar';
import FlipBookView from './FlipBookView';
import PropTypes from 'prop-types';
import aheadSVG from '@plone/volto/icons/ahead.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { createContent } from '@plone/volto/actions';
import { isEqual } from 'lodash';
import loadable from '@loadable/component';
import navTreeSVG from '@plone/volto/icons/nav.svg';
import { readAsDataURL } from 'promise-file-reader';
import uploadSVG from '@plone/volto/icons/upload.svg';

const messages = defineMessages({
  FileBlockInputPlaceholder: {
    id: 'Browse the site, drop a file, or type an URL',
    defaultMessage: 'Ricerca sul sito o carica un file',
  },
  uploadingFile: {
    id: 'Uploading file',
    defaultMessage: 'Carica file',
  },
});

const Dropzone = loadable(() => import('react-dropzone'));

// const FlipBookEdit = (props) => {
class FlipBookEdit extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    selected: PropTypes.bool.isRequired,
    block: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    content: PropTypes.objectOf(PropTypes.any).isRequired,
    request: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    pathname: PropTypes.string.isRequired,
    onChangeBlock: PropTypes.func.isRequired,
    onSelectBlock: PropTypes.func.isRequired,
    onDeleteBlock: PropTypes.func.isRequired,
    onFocusPreviousBlock: PropTypes.func.isRequired,
    onFocusNextBlock: PropTypes.func.isRequired,
    handleKeyDown: PropTypes.func.isRequired,
    createContent: PropTypes.func.isRequired,
    openObjectBrowser: PropTypes.func.isRequired,
  };
  state = {
    uploading: false,
    url: '',
    dragging: false,
  };

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.props.request.loading &&
      nextProps.request.loaded &&
      this.state.uploading
    ) {
      this.setState({
        uploading: false,
      });
      this.props.onChangeBlock(this.props.block, {
        ...this.props.data,
        url: nextProps.content['@id'],
        alt: '',
      });
    }
  }

  /**
   * @param {*} nextProps
   * @returns {boolean}
   * @memberof Edit
   */
  shouldComponentUpdate(nextProps) {
    return (
      this.props.selected ||
      nextProps.selected ||
      !isEqual(this.props.data, nextProps.data)
    );
  }

  /**
   * Change url handler
   * @method onChangeUrl
   * @param {Object} target Target object
   * @returns {undefined}
   */
  onChangeUrl = ({ target }) => {
    debugger;
    this.setState({
      url: target.value,
    });
  };

  /**
   * Submit url handler
   * @method onSubmitUrl
   * @param {object} e Event
   * @returns {undefined}
   */
  onSubmitUrl = () => {
    debugger;
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      url: flattenToAppURL(this.state.url),
    });
  };

  /**
   * Keydown handler on Variant Menu Form
   * This is required since the ENTER key is already mapped to a onKeyDown
   * event and needs to be overriden with a child onKeyDown.
   * @method onKeyDownVariantMenuForm
   * @param {Object} e Event object
   * @returns {undefined}
   */
  onKeyDownVariantMenuForm = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      this.onSubmitUrl();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      // TODO: Do something on ESC key
    }
  };
  onDrop = (file) => {
    // console.log(file);
    this.setState({
      uploading: true,
    });
    readAsDataURL(file[0]).then((data) => {
      const fields = data.match(/^data:(.*);(.*),(.*)$/);
      this.props.createContent(
        getBaseUrl(this.props.pathname),
        {
          '@type': 'File',
          title: file[0].name,
          file: {
            data: fields[3],
            encoding: fields[2],
            'content-type': fields[1],
            filename: file[0].name,
          },
        },
        this.props.block,
      );
    });
  };

  onDragEnter = () => {
    this.setState({ dragging: true });
  };

  onDragLeave = () => {
    this.setState({ dragging: false });
  };

  node = React.createRef();

  render() {
    const placeholder =
      this.props.data.placeholder ||
      this.props.intl.formatMessage(messages.FileBlockInputPlaceholder);

    return (
      <div>
        {this.props.data.url && <FlipBookView {...this.props} />}
        <div>
          {!this.props.data.url && this.props.editable && (
            <Dropzone
              noClick
              onDrop={this.onDrop}
              onDragEnter={this.onDragEnter}
              onDragLeave={this.onDragLeave}
              className="dropzone"
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <Message>
                    {this.state.dragging && <Dimmer active></Dimmer>}
                    {this.state.uploading && (
                      <Dimmer active>
                        <Loader indeterminate>
                          {this.props.intl.formatMessage(
                            messages.uploadingFile,
                          )}
                        </Loader>
                      </Dimmer>
                    )}
                    <div className="no-file-wrapper">
                      <div className="toolbar-inner">
                        <Button.Group>
                          <Button
                            basic
                            icon
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              this.props.openObjectBrowser({
                                mode: 'link',
                                dataName: 'url',
                              });
                            }}
                          >
                            <Icon name={navTreeSVG} size="24px" />
                          </Button>
                        </Button.Group>
                        <Button.Group>
                          <label className="ui button basic icon">
                            <Icon name={uploadSVG} size="24px" />
                            <input
                              {...getInputProps({
                                type: 'file',
                                onChange: this.onUploadFile,
                                style: { display: 'none' },
                              })}
                            />
                          </label>
                        </Button.Group>
                        <Input
                          onKeyDown={this.onKeyDownVariantMenuForm}
                          onChange={this.onChangeUrl}
                          placeholder={placeholder}
                          value={this.state.url}
                          onClick={(e) => {
                            e.target.focus();
                          }}
                          onFocus={(e) => {
                            this.props.onSelectBlock(this.props.id);
                          }}
                        />
                        {this.state.url && (
                          <Button.Group>
                            <Button
                              basic
                              className="cancel"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ url: '' });
                              }}
                            >
                              <Icon name={clearSVG} size="30px" />
                            </Button>
                          </Button.Group>
                        )}
                        <Button.Group>
                          <Button
                            basic
                            primary
                            disabled={!this.state.url}
                            onClick={(e) => {
                              e.stopPropagation();
                              this.onSubmitUrl();
                            }}
                          >
                            <Icon name={aheadSVG} size="30px" />
                          </Button>
                        </Button.Group>
                      </div>
                    </div>
                  </Message>
                </div>
              )}
            </Dropzone>
          )}
        </div>
        <SidebarPortal selected={this.props.selected}>
          <FlipBookSidebar {...this.props} />
        </SidebarPortal>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withBlockExtensions,
  connect(
    (state, ownProps) => ({
      request: state.content.subrequests[ownProps.block] || {},
      content: state.content.subrequests[ownProps.block]?.data,
    }),
    { createContent },
  ),
)(FlipBookEdit);
