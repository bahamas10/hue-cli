hue(1)
======

A command line interface to [philips hue](http://meethue.com)

**NOTE:** A more complete and updated implementation of a Hue Management CLI
can be found here https://github.com/bahamas10/hueadm

Installation
------------

First, install [Node.js](http://nodejs.org), then:

    npm install -g hue-cli

...and the executable will be installed globally as `hue`

Usage
-----

    Usage: hue [-c config] [-H host] [--json] [command]

    control philips hue over the command line

    examples
      hue config                  # view the hue config
      hue lights                  # get a list of lights
      hue lights 5                # get information about light 5
      hue lights 5,6,7 on         # turn lights 5 6 and 7 on
      hue lights on               # turn all lights on
      hue lights 1 ff0000         # turn light 1 red
      hue lights 1 red            # same as above
      hue lights 1 +10            # increase the brightness by 10 (out of 254)
      hue lights 1 -10            # decrease the brightness by 10 (out of 254)
      hue lights 1 =100           # set the brightness to 100 (out of 254)
      hue lights 1 +10%           # increase the brightness by 10%
      hue lights 1 -10%           # decrease the brightness by 10
      hue lights 1 =100%          # set the brightness to 100%
      hue lights 4,5 colorloop    # enable the colorloop effect on lights 4 and 5
      hue lights 4,5 alert        # blink lights 4 and 5 for 30 seconds
      hue lights 4,5 clear        # clear any effects on lights 4 and 5
      hue lights 1 state          # set the state on light 1 as passed in as JSON over stdin
      hue rename 1 light-name     # set light 1's name to the given string
      hue lights reset            # reset all lamps to default (on, as if the bulb was just flipped on)
      hue lights 1,2 reset        # reset just bulbs 1 and 2
      hue help                    # this message
      hue register                # register this app to hue
      hue search                  # search for hue base stations

    commands
      config, lights, help, register, search

    options
      -c, --config <file>    config file, defaults to ~/.hue.json
      -h, --help             print this message and exit
      -H, --host             the hostname or ip of the bridge to control
      -j, --json             force output to be in json
      -u, --updates          check for available updates
      -v, --version          print the version number and exit

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
       1 Mike 1
       2 Mike 2
       3 Dave closet
       4 Hallway 2
       5 Hallway 1
       6 Front hallway
       7 Dave Ledge Left
       8 Dave Ledge Right
       9 Dave's Piano
      10 Dave's Lamp
      11 Balcony Mike
      12 Balcony Dave
      13 Balcony Living Room
      14 Mike 3
      15 Living room 3
      16 Living room 1

Again, `-j` if you'd like json output.

Running with the command `lights` will give us a list of all the lights
connected to the base station.

From here, we can get information about a single light like:

    $ hue lights 1
       1 on    141    Mike 1

141 in the above example is the brightness.

And `-j` for json

    $ hue -j lights 1
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

How about hex

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

### brightness

Brightness can also be changed using the `=`, `+` and `-` operators

    $ hue lights 1 +20
    light 1 brightness 200 -> 220
    $ hue lights 1 -30
    light 1 brightness 220 -> 190
    $ hue lights 1 =150
    light 1 brightness 150

### effects

You can enable the colorloop effect on lamps by running

    $ hue lights 4,5,6 colorloop
    light 4 success
    light 5 success
    light 6 success

and clear all effects with

    $ hue lights 4,5,6 clear
    light 4 success
    light 5 success
    light 6 success

### debugging

Last but not least, you can pass the state as JSON over stdin.  The possible
values are found at [http://developers.meethue.com/1_lightsapi.html](http://developers.meethue.com/1_lightsapi.html)
in section 1.6.

    $ echo '{"bri": 240, "hue": 25500}' | hue lights 7 state

The `state` keyword tells `hue` to read from stdin

Config
------

A config file will be created at `~/.hue.json` upon registration that looks like...

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

* [Philips hue](http://meethue.com): I assume you know what this is by now
* [hue.js](https://github.com/thatguydan/hue.js): Node.js hue client
* [css-color-names](https://github.com/bahamas10/css-color-names): color aliases provided by this module

License
-------

MIT
