export default AccountFormAccountId;
declare class AccountFormAccountId extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        accountId: string;
        invalidAccountIdLength: boolean;
        wrongChar: boolean;
    };
    checkAccountAvailabilityTimer: null;
    canvas: null;
    suffix: React.RefObject<any>;
    updateSuffix: (userValue: any) => void;
    getTextWidth: (text: any, font: any) => any;
    handleChangeAccountId: ({ userValue, el }: {
        userValue: any;
        el: any;
    }) => false | undefined;
    checkAccountIdLength: (accountId: any) => boolean;
    handleAccountIdLengthState: (accountId: any) => void;
    handleCheckAvailability: (accountId: any, type: any) => any;
    isImplicitAccount: (accountId: any) => boolean;
    get loaderLocalAlert(): {
        messageCode: string;
    };
    get accountIdLengthLocalAlert(): {
        success: boolean;
        messageCode: string;
    };
    get sameAccountLocalAlert(): {
        success: boolean;
        show: boolean;
        messageCode: string;
    };
    get implicitAccountLocalAlert(): {
        success: boolean;
        messageCode: string;
    };
    get localAlertWithFormValidation(): any;
    render(): JSX.Element;
}
declare namespace AccountFormAccountId {
    namespace propTypes {
        const handleChange: PropTypes.Validator<(...args: any[]) => any>;
        const checkAvailability: PropTypes.Validator<(...args: any[]) => any>;
        const placeholder: PropTypes.Validator<string>;
        const autoFocus: PropTypes.Requireable<boolean>;
        const accountIdSuffix: PropTypes.Validator<string>;
    }
    namespace defaultProps {
        const autoFocus_1: boolean;
        export { autoFocus_1 as autoFocus };
        export const pattern: RegExp;
        export const type: string;
        const accountIdSuffix_1: string;
        export { accountIdSuffix_1 as accountIdSuffix };
    }
}
import React from "react";
import PropTypes from "prop-types";
