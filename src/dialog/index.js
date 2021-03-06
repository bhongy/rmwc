// @flow
import type { SimpleTagPropsT, CustomEventT } from '@rmwc/base';
import type { ButtonPropsT } from '@rmwc/button';

import * as React from 'react';
import {
  MDCDialog,
  MDCDialogFoundation
} from '@material/dialog/dist/mdc.dialog';

import Button from '@rmwc/button';
import { simpleTag, noop } from '@rmwc/base';

import { withFoundation, syncFoundationProp } from '@rmwc/base/withFoundation';

export const DialogRoot = simpleTag({
  displayName: 'DialogRoot',
  defaultProps: {
    role: 'alertdialog'
  },
  tag: 'aside',
  classNames: 'mdc-dialog'
});

/** The Dialog backdrop */
export const DialogBackdrop = simpleTag({
  displayName: 'DialogBackdrop',
  classNames: 'mdc-dialog__backdrop'
});

/** The Dialog surface */
export const DialogSurface = simpleTag({
  displayName: 'DialogSurface',
  classNames: 'mdc-dialog__surface'
});

/** The Dialog header */
export const DialogHeader = simpleTag({
  displayName: 'DialogHeader',
  tag: 'header',
  classNames: 'mdc-dialog__header'
});

/** The Dialog title */
export const DialogHeaderTitle = simpleTag({
  displayName: 'DialogHeaderTitle',
  tag: 'h2',
  classNames: 'mdc-dialog__header__title'
});

export type DialogBodyPropsT = {
  /** Make it scrollable. */
  scrollable?: boolean
} & SimpleTagPropsT;

const DialogBodyRoot = simpleTag({
  displayName: 'DialogBodyRoot',
  tag: 'section',
  classNames: (props: DialogBodyPropsT) => [
    'mdc-dialog__body',
    {
      'mdc-dialog__body--scrollable': props.scrollable
    }
  ],
  consumeProps: ['scrollable']
});

/** The Dialog body */
export const DialogBody: React.ComponentType<DialogBodyPropsT> = (
  props: DialogBodyPropsT
) => <DialogBodyRoot {...props} />;

/** The Dialog footer */
export const DialogFooter = simpleTag({
  displayName: 'DialogFooter',
  tag: 'footer',
  classNames: 'mdc-dialog__footer'
});

export type DialogFooterButtonPropsT = {
  /** Make it an accept button. */
  accept?: any,
  /** Make it a cancel button. */
  cancel?: boolean
} & SimpleTagPropsT &
  ButtonPropsT;

const DialogFooterButtonRoot = simpleTag({
  displayName: 'DialogFooterButtonRoot',
  tag: Button,
  classNames: (props: DialogFooterButtonPropsT) => [
    'mdc-dialog__footer__button',
    {
      'mdc-dialog__footer__button--cancel': props.cancel,
      'mdc-dialog__footer__button--accept': props.accept
    }
  ],
  consumeProps: ['accept', 'cancel']
});

/** A Dialog footer button */
export const DialogFooterButton: React.ComponentType<
  DialogFooterButtonPropsT
> = props => <DialogFooterButtonRoot {...props} />;
DialogFooterButton.displayName = 'DialogFooterButton';

export type DialogPropsT = {
  /** Whether or not the Dialog is showing. */
  open: boolean,
  /** Callback for when the accept Button is pressed. */
  onAccept?: (evt: CustomEventT<void>) => mixed,
  /** Callback for when the Dialog was closed without acceptance. */
  onCancel?: (evt: CustomEventT<void>) => mixed,
  /** Callback for when the Dialog closes. */
  onClose?: (evt: CustomEventT<void>) => mixed
};

export class Dialog extends withFoundation({
  constructor: MDCDialog,
  adapter: {
    notifyAccept: function() {
      const evt = this.emit(MDCDialogFoundation.strings.ACCEPT_EVENT);
      this.props.onClose && this.props.onClose(evt);
    },
    notifyCancel: function() {
      const evt = this.emit(MDCDialogFoundation.strings.CANCEL_EVENT);
      this.props.onClose && this.props.onClose(evt);
    }
  }
})<DialogPropsT> {
  static displayName = 'Dialog';

  show: Function;
  close: Function;
  open: boolean;

  syncWithProps(nextProps: DialogPropsT) {
    // open
    syncFoundationProp(nextProps.open, this.open, () => {
      nextProps.open ? this.show() : this.close();
    });
  }

  render() {
    const { open, onAccept, onCancel, onClose, apiRef, ...rest } = this.props;
    const { root_ } = this.foundationRefs;

    return <DialogRoot {...rest} elementRef={root_} />;
  }
}

export type SimpleDialogPropsT = {
  /** A title for the default Dialog template. */
  title?: React.Node,
  /** Additional Dialog header content for the default Dialog template. */
  header?: React.Node,
  /** Body content for the default Dialog template, rendered before children. */
  body?: React.Node,
  /** Additional footer content for the default Dialog template, rendered before any buttons. */
  footer?: React.Node,
  /** Creates an accept button for the default Dialog template with a given label. You can pass `null` to remove the button.*/
  acceptLabel?: React.Node,
  /** Creates an cancel button for the default Dialog with a given label. You can pass `null` to remove the button.*/
  cancelLabel?: React.Node,
  /** Any children will be rendered in the body of the default Dialog template. */
  children?: React.Node,
  /** Allow the body to be scrollable */
  scrollable?: boolean
} & DialogPropsT;

/** A non-standard SimpleDialog component for ease of use. */
export class SimpleDialog extends React.Component<SimpleDialogPropsT> {
  static defaultProps = {
    title: undefined,
    header: undefined,
    body: undefined,
    footer: undefined,
    scrollable: undefined,
    acceptLabel: 'Accept',
    cancelLabel: 'Cancel',
    open: false,
    onAccept: noop,
    onCancel: noop,
    onClose: noop,
    children: undefined
  };

  render() {
    const {
      title,
      header,
      body,
      footer,
      scrollable,
      acceptLabel,
      cancelLabel,
      children,
      open,
      ...rest
    } = this.props;

    return (
      <Dialog open={open} {...rest}>
        <DialogSurface>
          {(!!title || !!header) && (
            <DialogHeader>
              {!!title && <DialogHeaderTitle>{title}</DialogHeaderTitle>}
              {!!header && header}
            </DialogHeader>
          )}
          {(!!body || children) && (
            <DialogBody scrollable={scrollable}>
              {body}
              {children}
            </DialogBody>
          )}

          {(!!cancelLabel || !!acceptLabel) && (
            <DialogFooter>
              {!!footer && { footer }}
              {!!cancelLabel && (
                <DialogFooterButton cancel>{cancelLabel}</DialogFooterButton>
              )}
              {!!acceptLabel && (
                <DialogFooterButton accept>{acceptLabel}</DialogFooterButton>
              )}
            </DialogFooter>
          )}
        </DialogSurface>
        <DialogBackdrop />
      </Dialog>
    );
  }
}
