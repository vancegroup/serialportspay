This is the readme for jslint-for-wsh and
flymake-for-jslint-for-wsh. Available from
http://code.google.com/p/jslint-for-wsh/

JSLINT is a lovely tool from Douglas Crockford - find it at
http://www.jslint.com/

JSLINT checks Javascript code for common problems and style
conformance. The original version of JSLINT uses STDIN as the input.
The modification here enables jslint to read from a filesystem file,
specified on the command line of cscript.exe .

There's a big advantage to doing this: error messages that the modified
JSLINT emits can include the file that contains the error.

The format of the error messages emitted from this modified version of
jslint is like this:

    sprintf.js(53,42) JSLINT: Use the array literal notation [].

Nice.

-----

To use jslint-for-wsh.js from the command line, run it like this;

  cscript.exe  [path-to-jslint-for-wsh.js]   [js-source-module]

example:

  cscript.exe  \bin\jslint-for-wsh.js   sprintf.js

-----

There is a forked version of JSLINT called JSHINT. It is more
configurable and can be less fascist in its enforcement of various
code conventions.  It works exactly the same way as JSLINT.  I've
included a modified version of JSHINT in this archive, as well.


-----

You can use jslint-for-wsh or jshint-for-wsh from within emacs.  There
are two primary ways. You can choose one or the other or both.

  (a) with M-x compile.

  (b) with flymake.


For (a), insert this into your .emacs file:

    (defun my-javascript-mode-fn ()
      (turn-on-font-lock)
      ;; jslint-for-wsh.js, produces errors like this:
      ;; file.cs(6,18): JSLINT: The body of a for in should be wrapped in an if statement ...
      (if (boundp 'compilation-error-regexp-alist-alist)
          (progn
            (add-to-list
             'compilation-error-regexp-alist-alist
             '(jslint-for-wsh
               "^[ \t]*\\([A-Za-z.0-9_: \\-]+\\)(\\([0-9]+\\)[,]\\( *[0-9]+\\))\\( Microsoft JScript runtime error\\| JSLINT\\| JSHINT\\): \\(.+\\)$" 1 2 3))
            (add-to-list
             'compilation-error-regexp-alist
             'jslint-for-wsh)))
      (if buffer-file-name
          (progn
            (make-local-variable 'compile-command)
            (setq compile-command
                  (let ((filename (file-name-nondirectory buffer-file-name)))
                    (concat (getenv "windir")
                            "\\system32\\cscript.exe \\bin\\jshint-for-wsh.js "
                            filename)))))
      )

    ;; use whichever javascript mode you prefer
    (add-hook 'javascript-mode-hook 'my-javascript-mode-fn)
    (add-hook 'espresso-mode-hook 'my-javascript-mode-fn)


Be sure to specify the path you used for jslint-for-wsh.js or
jshint-for-wsh.js , whichever you decide to use.


-----

For (b), this package also contains an elisp module,
flymake-for-jslint-for-wsh.el, that lets you easily run flymake
using jslint.

To do so,

 1. put the elisp file, flymake-for-jslint-for-wsh.el, in your emacs load-path.

 2. put the js file, jslint-for-wsh.js , in a well-known location

 3. add something like the following in your .emacs file:

    (require 'flymake-for-jslint-for-wsh "flymake-for-jslint-for-wsh.el")
    (setq flymake-for-jslint-jslint-location "\\cheeso\\bin\\jshint-for-wsh.js")

    (defun my-javascript-mode-fn ()
         (flymake-mode 1)
    )

    ;; use whichever javascript mode you prefer
    (add-hook 'javascript-mode-hook 'my-javascript-mode-fn)
    (add-hook 'espresso-mode-hook 'my-javascript-mode-fn)


Again, be sure to configure the path for jshint correctly.

-----

Obviously, if you want to be able to use both flymake and M-x compile,
you can combine those hook functions into one.


-----


flymake-cursor.el

This is an additional module that shows any flymake error on the current
line, in the modeline.  Handy.  to use it, just do this:

  (require 'flymake-cursor)

The use of flymake-cursor.el is entirely independent of
flymake-for-jslint-for-wsh.el  .




original: Thu, 20 May 2010  09:46
updated: Thu, 15 Sep 2011  16:57
