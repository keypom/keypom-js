export default LocalAlertBox;
/**
 * Renders request status.
 *
 * @param localAlert {object} request status, can be null in case not completed yet / no outgoing request
 * @param localAlert.success {boolean} true if request was succesful
 * @param localAlert.messageCode {string} localization code of status message to display
 */
declare function LocalAlertBox({ localAlert, accountId, dots }: {
    success: boolean;
    messageCode: string;
}): JSX.Element | null;
