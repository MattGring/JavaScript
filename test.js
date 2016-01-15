/*
* Color print jobs require user confirmation
*
* Color printing is expensive so users should be encouraged to print
* in grayscale whenever they print in color. No confirmation is required
* for grayscale jobs.
*/
function printJobHook(inputs, actions) {
  /*
  * This print hook will need access to all job details
  * so return if full job analysis is not yet complete.
  * The only job details that are available before analysis
  * are metadata such as username, printer name, and date.
  *
  * See reference documentation for full explanation.
  */
  if (!inputs.job.isAnalysisComplete) {
    // No job details yet so return.
    return;
  }
  
  
  
  
  if (inputs.job.isColor) {
    /* Color job, ask the use if they want to print. The job cost is displayed
    * prominently to encourage users to consider black and white printing instead.
    */
    var response = actions.client.promptPrintCancel(
      "<html>This print job is <span style='color:red'><b>color</b></span>"
      + " and costs <b>" + inputs.utils.formatCost(inputs.job.cost)
      + "</b>.  You can save money by printing the job in grayscale.<br><br>" 
      + "Do you want to print this job?</html>",
      {"dialogTitle" : "Color print job", 
       "dialogDesc"  : "Consider printing in grayscale to reduce costs"});
    if (response == "CANCEL" || response == "TIMEOUT") {
      // User did not respond, cancel the job and exit script.
      actions.job.cancel();
      return;
    }
  }
  
  
  
  var LIMIT             = 10; // Redirect jobs over 10 pages.
  
  /*
  * NOTE: The high-volume printer must be compatible with the source printer.
  *       i.e. use the same printer language like PCL or Postscript.
  *       If this is a virtual queue, all printers in the queue must use
  *       the same printer language.
  */
  var HIGH_VOL_PRINTER  = "Perrysburg Showroom M3150";
  
  if (inputs.job.totalPages > LIMIT) {
    /*
    * Specify actions.job.bypassReleaseQueue() if you wish to bypass the release queue
    * on the original printer the job was sent to.  (Otherwise if held at the target,
    * the job will need to be released from two different queues before it will print.)
    */
    actions.job.bypassReleaseQueue();
    
    /*
    * Job is larger than our page limit, so redirect to high-volume printer,
    * and send a message to the user.
    * Specify "allowHoldAtTarget":true to allow the job to be held at the hold/release
    * queue for the high-volume printer, if one is defined.
    */
    
    actions.job.redirect(HIGH_VOL_PRINTER, {allowHoldAtTarget: true});
    
    // Notify the user that the job was automatically redirected.
    actions.client.sendMessage(
      "The print job was over " + LIMIT + " pages and was sent to " 
      + " printer: " + HIGH_VOL_PRINTER + ".");
    
    // Record that the job was redirected in the application log.
    actions.log.info("Large job redirected from printer '" + inputs.job.printerName 
                     + "' to printer '" + HIGH_VOL_PRINTER + "'.");
  }
  
  
}
