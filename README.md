hue(1)
======

A command line interface to [phillips hue](http://meethue.com)

Installation
------------

First, install [Node.js](http://nodejs.org), then:

    npm install -g hue-cli

...and the executable will be installed globally as `hue`

Usage
-----

    Usage: hue [-H host] [--json] [command]

    control phillips hue over the command line

    examples
      hue config          # view the hue config
      hue lights          # get a list of lights
      hue lights 5        # get information about light 5
      hue lights 5,6,7 on # turn lights 5 6 and 7 on
      hue help            # this message
      hue register        # register this app to hue, done automatically
      hue search          # search for hue base stations

    commands
      config, lights, help, register, search

    options
      -h, --help     print this message and exit
      -H, --host     the hostname or ip of the bastion to control
      -i, --init     initialize the config file at /Users/dave/.hue.json
      -j, --json     force output to be in json
      -u, --updates  check for available updates
      -v, --version  print the version number and exit

Example
-------

### starting off

First, let's search for nearby base stations

    $ hue search
    1 stations found

    1: 10.0.1.218

Pass in `-j` for json if you'd like

    $ hue -j search
    [
      "10.0.1.218"
    ]

Next, let's try to list the lights on that base station

    $ hue -H 10.0.1.218 lights
    error: application not registered, run `hue register` first

This app isn't registered yet, let's go ahead and do that

    $ hue -H 10.0.1.218 register
    please go and press the link button on your base station
    Hue Base Station paired!

### listing lights

All you had to do was press the button on your base station to register, cool
right?  Let's re-run the lights command

    $ hue -H 10.0.1.218 lights
    1: Mike 1
    2: Mike 2
    3: Dave closet
    4: Hallway 2
    5: Hallway 1
    6: Front hallway
    7: Dave Ledge Left
    8: Dave Ledge Right

Again, `-j` if you'd like json output.

Running with the command `lights` will give us a list of all the lights
connected to the base station.

Before we continue, let's create a configuration file.  In the file we can
set the default host to connect to, so we don't have to keep supplying the
`-H` argument.  Run:

    $ hue --init
    config file written to `~/.hue.json`

Now, modify that file and replace `null` with `10.0.1.218`, or whatever
your IP or hostname is. Now we'll no longer have to supply the `-H` argument
with every command.

From here, we can get information about a single light like:

    $ hue lights 1
    {
      "state": {
        "on": true,
        "bri": 141,
        "hue": 13122,
        "sat": 211,
        "xy": [
          0.5119,
          0.4147
        ],
        "ct": 467,
        "alert": "none",
        "effect": "none",
        "colormode": "ct",
        "reachable": true
      },
      "type": "Extended color light",
      ...
    }

### controlling the lights

Let's actually mess with the lights now.  Let's turn on the light in my closet.

    $ hue lights 3 on
    light 3 success

What about both lights in the hallway?

    $ hue lights 4,5 on
    light 4 success
    light 5 success

What if we try to turn on a non-existent light?

    $ hue lights 99 on
    light 99 failed: resource, /lights/99/state, not available

Cool, errors handled properly.  Let's see some more examples

    $ hue lights off
    light 1 success
    light 2 success
    light 3 success
    ...

This is shorthand for

    $ hue lights all off

Where `all` is a recognized keyword for all lights in the system.  You can also:

    $ hue lights off

To quickly turn off all lights on the system

### controlling colors

> We can turn the lights on and off, that's great... what about colors?

You want colors? how about hex

    $ hue lights 4 ffffff
    light 4 success

We just set the light in the hallway to pure white, hex `ffffff`.  Let's go crazy
and turn all of the lights in the house red (this is where we need the `all` keyword)

    $ hue lights all ff0000
    light 1 success
    light 2 success
    ...

It's worth noting here that, because this tool is written in Node, all requests to the
lights are done concurrently.  This means we don't have to wait for light 1 to finish
before we instruct light 2 to change, nor wait for light 2 to finish before we instruct
light 3 to change, and so on.

Shorthand hex is also supported

    $ hue lights 3,4 0f0
    light 3 success
    light 4 success

Now lights 3 and 4 are green

Last but not least, any CSS name is supported for colors

    $ hue lights 1 yellow
    light 1 success

Light 1 is now yellow. The full list of colors is available here
http://xahlee.info/js/css_color_names.html

Config
------

An optional config file can be created at `~/.hue.json` that looks like...

``` json
{
  "host": "1.2.3.4",
  "colors": {
    "myred": "fe0000",
    "myblue": "0000fe"
  }
}
```

* `host`: the host to connect to (normally passed in as `-H`)
* `colors`: a key-value pair of color aliases to their hex mapping, you can use these
when changing the colors of a light

Credits
-------

* [Phillips hue](http://meethue.com): I assume you know what this is by now
* [hue.js](https://github.com/thatguydan/hue.js): Node.js hue client
* [css-color-names](https://github.com/bahamas10/css-color-names): color aliases provided by this module

License
-------

MIT
