# Choosing an API convention

This document describes the thought process behind our decision to adopt
RPC-style APIs as our convention, as opposed to the commonplace REST convention.

## 1. Introduction

_Feel free to skip this section if you are already familiar with the context._

A web service is a software system which exposes functionalities to other
machines over a network. These services (the "server") must be able to be
invoked remotely by the consumer (the "client"). In order to do so, the server
and the client agree on an API convention, i.e., a set of rules that govern the
interactions between both systems. These rules cover 4 areas:

* syntax
* semantics
* message synchronization
* error handling

There are several popular API conventions. One of the most popular ones is HTTP.
In fact, HTTP is so popular that a whole lot of usage conventions have been
defined on top of it (such as REST, SOAP, BEEP, UDDI, and many, many, many
[others](https://en.wikipedia.org/wiki/List_of_web_service_protocols)).

## 2. What's wrong with REST?

A simple web search for `problems with rest apis` will find thousands of blogs
and articles about all kinds of problems with REST. This should not come as a
surprise to anyone who's ever worked with it. For reference, two of our
favorites are [here](https://mmikowski.github.io/the_lie/) and [here](https://joost.vunderink.net/blog/2016/01/03/why-we-chose-json-rpc-over-rest/).

1. **All the points made in the link above**

   We will not bore you with the same points made in those links above, but we
   will present a few extra points of our own below.

1. **Too much time spent on the HTTP layer**

   I have seen far too much code trying to map application results, errors, and
   exceptions to specific HTTP status codes. This is not just arguing that the
   error codes are either insufficient or confusing (as the link above asserts).
   All the time being spent in writing code and tests, fixing bugs, going
   through QA, etc., because you have to transform an `InvalidArgumentException`
   into a `417 Expectation failed` just because some purist said so is simply
   not rationally justifiable.

   And this is assuming that you have written your logic layer decoupled from
   the HTTP layer.

1. **The HTTP layer is not reusable**

   If you want your service to start supporting different protocols (eg,
   protobuf over RabbitMQ, or WebSocket), now you have to re-write some of that
   layer.

1. **HTTP has a favorite verb**

   And in case you didn't know, it's `GET`. All HTTP links, when clicked on, are
   opened as opened as `GET`, because that's the default action in the browser.

   Say that you want to have an e-mail with an "Unsubscribe" link at the bottom.
   When you click on that link, it's a `GET` action that will be invoked on that
   resource. So now you are faced with 2 options: either you have compromise the
   purity of your RESTful design, or you have a layer of indirection before the
   invocation of the original RESTful action).

## 3. Advantages of RPC-style

1. **Easier and faster to write code**

   The code that handles requests is simply code. For example, a function that
   calculates the price for a plane ticket would look like this:

   ```javascript
   function computeFare(from, to, date, fareClass) {
       // ...
       return result;
   }
   ```

   Pretty simple, right? No HTTP, or any other transport layer. Only the
   application logic that actually needs to be written and tested. *All you have
   is code, which takes inputs (parameters) and produces output (result)*. In
   other words, all you have is a function. Easy to write, easy to test.

   In order to expose it, there is a tiny runtime that loads the definitions and
   creates the HTTP layer. It could look like so:

   ```javascript
   const actions =
       [
           {
               action: 'fare.compute',
               dispatch: computeFare,
           },
           //...
       ];
   ```

   This layer is well-tested independently of any application code and, in fact,
   oftentimes does not even need to be written. The `npm` repository has several
   very popular libraries that fit such purpose.

1. **Transport independent**

   The transport layer can extremely easily be changed to generate different
   bindings (eg, HTTP/S, WebSockets, XMPP, telnet, SFTP, SCP, SSH, or even a
   whole different serialization mechanisms such as protobuf) without any
   changes to the application code.

   In fact, the same service can even support multiple bindings at the same
   time, from the same code!

1. **All the cool kids are doing it this way**

   The trend is to move away from REST, and most new high-profile projects have
   already embraced it. The [Slack API](https://api.slack.com/methods) is an
   example of an RPC-JSON style API. Netflix's [Falcor](http://netflix.github.io/falcor/documentation/jsongraph.html) is
   another.

   Facebook's [Relay](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html)
   does away with any pretense of using REST. As a matter of fact, they have a
   whole [section](https://facebook.github.io/react/blog/2015/05/01/graphql-introduction.html#rest) in their documentation critiquing it.

1. **Easier to develop against**

   The focus of this approach is on invoking a function by passing to it the
   required inputs, and then collecting the generated output. The transport
   layer used to do so is completely immaterial.

   For example, it's easy to see that we could expose the `fare.compute`
   function from the example above either through a `GET` or a `POST`, with
   identical results.

   ```c++
   GET fare.compute?from=JFK&to=CDG&date=20170601&fareClass=B
   ```

   ```c++
   POST fare.compute

   {
      "from": "JFK",
      "to": "CDG",
      "date": 20170601,
      "fareClass": "B"
   }
   ```

   The difference is that the `GET` version is much easier to develop against
   (for instance, it can easily be invoked from the browser). And invoking it
   from the command-line through tools such as `httpie` or `curl` does not
   involve ancillary files, or complicated syntax.

1. **GET-friendly**

   Because of the flexibility of this approach, it is possible to generate
   links (for instance, to be embedded in e-mails) that can cause side-effects
   (the CUD part of CRUD).

   Being able to support a single API for all use cases means productivity
   gains, less code, less bugs, better product. Example:

   ```c++
   GET list.unsubscribe?user=123&list=abc
   ```
