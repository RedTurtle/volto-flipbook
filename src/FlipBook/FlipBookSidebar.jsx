import { FormattedMessage, useIntl } from "react-intl";

import { BlockDataForm } from "@plone/volto/components";
import { FlipBookSchema } from "./schema";
import PropTypes from "prop-types";
import React from "react";
import { Segment } from "semantic-ui-react";

const FlipBookSidebar = (props) => {
  const { data, block, onChangeBlock } = props;
  const intl = useIntl();
  const schema = FlipBookSchema({ formData: data, intl });
  return (
    <>
      <header className="header pulled">
        <h2>
          <FormattedMessage id="File" defaultMessage="File" />
        </h2>
      </header>

      <Segment className="sidebar-metadata-container" secondary attached>
        {data.url ? (
          <></>
        ) : (
          <>
            <FormattedMessage id="No file selected" defaultMessage="No file selected" />
          </>
        )}
      </Segment>
      <BlockDataForm
        schema={schema}
        title={schema.title}
        onChangeField={(id, value) => {
          onChangeBlock(block, {
            ...data,
            [id]: value,
          });
        }}
        onChangeBlock={onChangeBlock}
        formData={data}
        block={block}
      />
    </>
  );
};

FlipBookSidebar.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  block: PropTypes.string.isRequired,
  onChangeBlock: PropTypes.func.isRequired,
};

export default FlipBookSidebar;
