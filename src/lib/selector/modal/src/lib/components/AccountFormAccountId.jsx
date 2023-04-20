import PropTypes from "prop-types";
import React, { Component, createRef } from "react";
import styled from "styled-components";

const classNames = (names) => {
  if (!names) {
    return false;
  }

  const isArray = Array.isArray;

  if (typeof names === "string") {
    return names || "";
  }

  if (isArray(names) && names.length > 0) {
    return names
      .map((name) => classNames(name))
      .filter((name) => !!name)
      .join(" ");
  }

  return Object.keys(names)
    .filter((key) => names[key])
    .join(" ");
};

export const ACCOUNT_CHECK_TIMEOUT = 500;

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  padding: 4px;
  margin: 5px -4px 30px -4px;

  input {
    margin-top: 0px !important;
  }

  &.wrong-char {
    input {
      animation-duration: 0.4s;
      animation-iteration-count: 1;
      animation-name: border-blink;

      @keyframes border-blink {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 88, 93, 0.8);
        }
        100% {
          box-shadow: 0 0 0 6px rgba(255, 88, 93, 0);
        }
      }
    }
  }

  &.create {
    .input-suffix {
      position: absolute;
      color: #a6a6a6;
      pointer-events: none;
      top: 50%;
      transform: translateY(-50%);
      visibility: hidden;
    }
  }
`;

class AccountFormAccountId extends Component {
  state = {
    accountId: this.props.defaultAccountId || "",
    invalidAccountIdLength: false,
    wrongChar: false,
  };

  checkAccountAvailabilityTimer = null;
  canvas = null;
  suffix = createRef();

  componentDidMount = () => {
    const { defaultAccountId } = this.props;
    const { accountId } = this.state;

    if (defaultAccountId) {
      this.handleChangeAccountId({ userValue: accountId });
    }
  };

  updateSuffix = (userValue) => {
    if (userValue.match(this.props.pattern)) {
      return;
    }
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      /Apple Computer/.test(navigator.vendor);
    const width = this.getTextWidth(userValue, "16px Inter");
    const extraSpace = isSafari ? 21.5 : 22;
    this.suffix.current.style.left = `${width}${extraSpace}px`;
    this.suffix.current.style.visibility = "visible";
    if (userValue.length === 0) {
      this.suffix.current.style.visibility = "hidden";
    }
  };

  getTextWidth = (text, font) => {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
    }
    const context = this.canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  handleChangeAccountId = ({ userValue, el }) => {
    const { pattern, handleChange, type } = this.props;

    const accountId = userValue.toLowerCase();

    if (accountId === this.state.accountId) {
      return;
    }

    if (accountId.match(pattern)) {
      if (this.state.wrongChar) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = null;
      } else {
        this.setState(() => ({
          wrongChar: true,
        }));
      }
      return false;
    } else {
      this.setState(() => ({
        wrongChar: false,
      }));
    }

    this.setState(() => ({
      accountId: accountId,
    }));

    handleChange(accountId);

    this.props.localAlert && this.props.clearLocalAlert();

    this.state.invalidAccountIdLength &&
      this.handleAccountIdLengthState(accountId);

    this.checkAccountAvailabilityTimer &&
      clearTimeout(this.checkAccountAvailabilityTimer);
    this.checkAccountAvailabilityTimer = setTimeout(() => {
      this.handleCheckAvailability(accountId, type);
    }, ACCOUNT_CHECK_TIMEOUT);
  };

  checkAccountIdLength = (accountId) => {
    const accountIdWithSuffix = `${accountId}.${this.props.accountIdSuffix}`;
    return accountIdWithSuffix.length >= 2 && accountIdWithSuffix.length <= 64;
  };

  handleAccountIdLengthState = (accountId) =>
    this.setState(() => ({
      invalidAccountIdLength:
        !!accountId && !this.checkAccountIdLength(accountId),
    }));

  isImplicitAccount = (accountId) => this.props.type !== "create" && accountId.length === 64;

  handleCheckAvailability = (accountId, type) => {
    if (!accountId) {
      return false;
    }
    if (this.isImplicitAccount(accountId)) {
      return true;
    }
    if (
      !(
        type === "create" &&
        !this.handleAccountIdLengthState(accountId) &&
        !this.checkAccountIdLength(accountId)
      )
    ) {
      return this.props.checkAvailability(
        type === "create" ? this.props.accountId : accountId
      );
    }
    return false;
  };


  get loaderLocalAlert() {
    return {
      messageCode: `account.create.checkingAvailablity.${this.props.type}`,
    };
  }

  get accountIdLengthLocalAlert() {
    return {
      success: false,
      messageCode: "account.create.errorInvalidAccountIdLength",
    };
  }

  get sameAccountLocalAlert() {
    return {
      success: false,
      show: true,
      messageCode: "account.available.errorSameAccount",
    };
  }

  get implicitAccountLocalAlert() {
    return {
      success: true,
      messageCode: "account.available.implicitAccount",
    };
  }

  get localAlertWithFormValidation() {
    const { accountId, invalidAccountIdLength } = this.state;
    const { mainLoader, localAlert } = this.props;

    if (!accountId) {
      return null;
    }
    if (this.isImplicitAccount(accountId)) {
      return this.implicitAccountLocalAlert;
    }
    if (mainLoader) {
      return this.loaderLocalAlert;
    }
    if (invalidAccountIdLength) {
      return this.accountIdLengthLocalAlert;
    }
    return localAlert;
  }

  render() {
    const { mainLoader, autoFocus, type, disabled } = this.props;

    const { accountId, wrongChar } = this.state;
    console.log("{ accountId, wrongChar }: ", { accountId, wrongChar });

    const localAlert = this.localAlertWithFormValidation;
    const success = localAlert?.success;
    const problem = !localAlert?.success && localAlert?.show;

    return (
      <InputWrapper
        className={classNames([
          type,
          { success: success },
          { problem: problem },
          { "wrong-char": wrongChar },
        ])}
      >
        <input
          name="accountId"
          data-test-id="createAccount.accountIdInput"
          value={accountId}
          onInput={(e) =>
            type === "create" && this.updateSuffix(e.target.value.trim())
          }
          onChange={(e) =>
            this.handleChangeAccountId({
              userValue: e.target.value.trim(),
              el: e.target,
            })
          }
          placeholder="placeholder"
          required
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          // rome-ignore lint/a11y/noPositiveTabindex: <explanation>
          tabIndex="1"
          disabled={disabled}
        />
        <span className="input-suffix" ref={this.suffix}>
          .{this.props.accountIdSuffix}
        </span>
      </InputWrapper>
    );
  }
}

AccountFormAccountId.propTypes = {
  handleChange: PropTypes.func.isRequired,
  checkAvailability: PropTypes.func.isRequired,
  defaultAccountId: PropTypes.string,
  autoFocus: PropTypes.bool,
  accountIdSuffix: PropTypes.string.isRequired
};

AccountFormAccountId.defaultProps = {
  autoFocus: false,
  pattern: /[^a-zA-Z0-9._-]/,
  type: "check",
  accountIdSuffix: 'testnet'
};

export default AccountFormAccountId;
