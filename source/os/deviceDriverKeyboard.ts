///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if(keyCode == 192 && isShifted){
                chr = String.fromCharCode(126); \\ ~
            } else if(keyCode == 192 && !isShifted){
                chr = String.fromCharCode(96); \\ `
            } else if(keyCode == 49 && isShifted){
                chr = String.fromCharCode(33); \\ !
            } else if(keyCode == 50 && isShifted){
                chr = String.fromCharCode(64); \\ @
            } else if(keyCode == 51 && isShifted){
                chr = String.fromCharCode(35); \\ #
            } else if(keyCode == 52 && isShifted){
                chr = String.fromCharCode(36); \\ $
            } else if(keyCode == 53 && isShifted){
                chr = String.fromCharCode(37); \\ %
            } else if(keyCode == 53 && isShifted){
                chr = String.fromCharCode(94); \\ ^
            } else if(keyCode == 55 && isShifted){
                chr = String.fromCharCode(38); \\ &
            } else if(keyCode == 56 && isShifted){
                chr = String.fromCharCode(42); \\ *
            } else if(keyCode == 57 && isShifted){
                chr = String.fromCharCode(40); \\ (
            } else if(keyCode == 48 && isShifted){
                chr = String.fromCharCode(41); \\ )
            } else if(keyCode == 189 && !isShifted){
                chr = String.fromCharCode(45); \\ -
            } else if(keyCode == 189 && isShifted){
                chr = String.fromCharCode(95); \\ _
            } else if(keyCode == 187 && !isShifted){
                chr = String.fromCharCode(61); \\ =
            } else if(keyCode == 187 && isShifted){
                chr = String.fromCharCode(43); \\ +
            } else if(keyCode == 219 && !isShifted){
                chr = String.fromCharCode(91); \\ [
            } else if(keyCode == 219 && isShifted){
                chr = String.fromCharCode(123); \\ {
            } else if(keyCode == 221 && !isShifted){
                chr = String.fromCharCode(125); \\ ]
            } else if(keyCode == 221 && isShifted){
                chr = String.fromCharCode(92); \\ }
            } else if(keyCode == 220 && !isShifted){
                chr = String.fromCharCode(92); \\ \
            } else if(keyCode == 220 && isShifted){
                chr = String.fromCharCode(124); \\ |
            } else if(keyCode == 186 && !isShifted){
                chr = String.fromCharCode(59); \\ ;
            } else if(keyCode == 186 && isShifted){
                chr = String.fromCharCode(58); \\ :
            } else if(keyCode == 222 && !isShifted){
                chr = String.fromCharCode(39); \\ '
            } else if(keyCode == 222 && isShifted){
                chr = String.fromCharCode(34); \\ "
            } else if(keyCode == 188 && !isShifted){
                chr = String.fromCharCode(44); \\ ,
            } else if(keyCode == 188 && isShifted){
                chr = String.fromCharCode(60); \\ <
            } else if(keyCode == 190 && !isShifted){
                chr = String.fromCharCode(46); \\ .
            } else if(keyCode == 190 && isShifted){
                chr = String.fromCharCode(62); \\ >
            } else if(keyCode == 191 && !isShifted){
                chr = String.fromCharCode(47); \\ /
            } else if(keyCode == 191 && isShifted){
                chr = String.fromCharCode(63); \\ ?
            }

            else if (((keyCode >= 48) && (keyCode <= 57)) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)) {                       // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
