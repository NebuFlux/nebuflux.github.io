import type { ArtifactData } from '../utility/ArtifactData';
import { getSpaCode } from './spaStaticProps';

export default async function Artifact_3() {

  const spaCode: ArtifactData = await getSpaCode();

  const alertSchema        = spaCode['Alert Model']?.['Schema']?.['content'];
  const aggregationPipeline = spaCode['Alerts Controller']?.['List with Aggregation Pipeline']?.['content'];
  const inputValidation    = spaCode['Routes']?.['Input Validation']?.['content'];
  const dualAuthRoutes     = spaCode['Routes']?.['Dual Auth Routes']?.['content'];
  const authenticateJWT    = spaCode['Routes']?.['Authenticate JWT']?.['content'];
  const authenticatePi     = spaCode['Routes']?.['Authenticate Pi']?.['content'];
  const loginCookie        = spaCode['Authentication Controller']?.['Login with httpOnly Cookie']?.['content'];
  const userSchema         = spaCode['User Model']?.['Schema with Plugin']?.['content'];
  const passportConfig     = spaCode['Passport Config']?.['Create Strategy']?.['content'];
  const jwtInterceptor     = spaCode['JWT Interceptor']?.['With Credentials']?.['content'];
  const getAlerts          = spaCode['Alert Data Service']?.['Get Alerts']?.['content'];
  const componentState     = spaCode['Alert Listing Component']?.['State']?.['content'];
  const loadAlerts         = spaCode['Alert Listing Component']?.['Load Alerts']?.['content'];
  const handlers           = spaCode['Alert Listing Component']?.['Handlers']?.['content'];
  const matTable           = spaCode['Alert Listing Template']?.['Mat Table']?.['content'];
  const matPaginator       = spaCode['Alert Listing Template']?.['Mat Paginator']?.['content'];

  return (
    <main className="flex flex-col p-5 mx-auto w-full max-w-[1600px]">

      <h1 className="text-center">
        Inspector Gadget SPA
      </h1>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1">
          <h3 className="mt-5 text-center">Where This Started</h3>
          <p className="indent-10">
            The original artifact for this submission is the Travlr Getaways MEAN
            stack application from CS 465 Full Stack Development I. That project 
            established an Express REST API backed by MongoDB, 
            an Angular single-page application (SPA) consuming it, and a Mongoose schema 
            modeling the domain. Authentication used JWTs stored in localStorage, 
            and the data model was built around travel listings and customer trips. 
            If you would like to see the source code for the original artifact 
            click <a target="_blank"
            href="https://github.com/NebuFlux/CS465-fullstack"
            >here</a>.
          </p>
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <h3 className="mt-5 text-center">A New Domain, A Tighter Security Bar</h3>
          <p className="indent-10">
            The enhancement repurposes that foundation as the backend and dashboard
            for the network intrusion detection system. The Raspberry Pi running the
            IDS needs to POST alerts somewhere persistent and analysts need to query,
            filter, and sort those alerts in a browser. I chose the MEAN stack as the right
            tool for both jobs. However, the security requirements are slightly different
            from a travel booking app. An IDS dashboard that leaks its auth
            token or accepts unauthenticated writes is a liability.
          </p>
        </div>
      </div>

      <h3 className="mt-10 text-center">Modeling the Alert Domain</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The alert schema maps directly to what the Pi's{' '}
          <code>Alert_System</code> posts: source IP, source port, destination,
          destination port, category (the classifier's output label), and a reported
          timestamp. Every field is required because a record missing a source or
          category is useless for incident response, so Mongoose rejects it before
          it reaches the database. The <code>category</code> field carries an index because 
          I projected the most common query pattern is filtering by attack type, and an unindexed
          scan over a growing alerts collection would degrade quickly.
        </p>
        <div key={'Alert Schema'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: alertSchema}}
        />
      </div>

      <h3 className="mt-10 text-center">Querying With an Aggregation Pipeline</h3>
      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The alert listing endpoint needs to support filtering by category,
          IP, date range, pagination, and sort, all simultaneously
          and in any combination. A chain of <code>Model.find()</code> calls would
          require multiple round-trips and force the server to hold the full result
          in memory to paginate it. MongoDB's aggregation pipeline handles this in
          a single round-trip. A <code>$match</code> stage applies whatever filters
          are active, then a <code>$facet</code> stage runs two sub-pipelines in
          parallel. One that sorts and paginates the matching documents, and one
          that counts them. The total count and the current page come back in the
          same response without a second query. The Mongoose and MongoDB 
          documentation made it straightforward to implement.
        </p>
        <div key={'Aggregation Pipeline'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: aggregationPipeline}}
        />
      </div>

      <h3 className="mt-10 text-center">Two Clients, Two Auth Paths</h3>
      <div className="flex flex-col lg:flex-row-reverse my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <p className="indent-10 lg:flex-1">
          The <code>/alerts</code> resource has two very different clients: the
          Raspberry Pi, which writes alerts via POST, and the Angular dashboard,
          which reads them via GET. These clients have different auth requirements
          and different threat models. The Pi is not an interactive user. It holds
          a static API key set in an environment variable and sends it as a Bearer
          token on every request. The Angular user logs in with a username and
          password and receives a short-lived JWT. Sharing a single mechanism
          between them would either weaken user authentication (static keys don't expire) or
          unnecessarily complicate the Pi. The solution is two middleware functions
          on the same route, with <code>authenticatePi</code> guarding writes and{' '}
          <code>authenticateJWT</code> guarding reads.
        </p>
        <div key={'Dual Auth Routes'} className="flex-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: dualAuthRoutes}}
        />
      </div>

      <div className="flex flex-col lg:flex-row my-2 mx-0.5 lg:my-4
      justify-center gap-2 lg:gap-4 w-full">
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <p className="indent-10">
            <code>authenticatePi</code> extracts the Bearer token from the
            Authorization header and compares it to the <code>API_KEY</code>{' '}
            environment variable. There is no database lookup and no cryptography.
            It is a secret that never leaves the server.
          </p>
          <div key={'Authenticate Pi'} className="max-w-full rounded-xl
          overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: authenticatePi}}
          />
        </div>
        <div className="flex flex-col lg:flex-1 min-w-0 gap-2">
          <p className="indent-10">
            <code>authenticateJWT</code> reads the token out of the httpOnly
            cookie, not the Authorization header or localStorage, and verifies
            its signature against <code>JWT_SECRET</code>. Reading from an httpOnly
            cookie means JavaScript running on the page can never access the token,
            which closes the Cross Site Scripting (XSS) theft vector.
          </p>
          <div key={'Authenticate JWT'} className="max-w-full rounded-xl
          overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
            dangerouslySetInnerHTML={{__html: authenticateJWT}}
          />
        </div>
      </div>

      <h3 className="mt-10 text-center">User Auth and Password Storage</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 order-1 lg:col-start-2 lg:row-start-1">
          Password storage is handled by <code>passport-local-mongoose</code>, which
          adds a salted PBKDF2 hash to the user schema as a plugin. There are no
          hand-written salt or hash routines in this codebase. The plugin's{' '}
          <code>register()</code> method handles credential creation, and{' '}
          <code>createStrategy()</code> wires up Passport's local strategy against
          that storage automatically. Using a well-audited library for credential
          storage keeps the attack surface small and avoids the class of vulnerabilities
          associated with creating your own.
        </p>
        <div key={'User Schema'} className="order-2 lg:col-start-1 lg:row-start-1 lg:row-span-3
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: userSchema}}
        />
        <div key={'Passport Config'} className="order-3 lg:col-start-2 lg:row-start-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: passportConfig}}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 order-1 lg:col-start-1">
          On successful login the JWT is written to a cookie with{' '}
          <code>httpOnly: true</code>, <code>sameSite: 'strict'</code>, and a
          1-hour max age. The <code>sameSite: strict</code> flag prevents the cookie
          from being sent on cross-site requests, mitigating CSRF attacks without a
          separate token. The response body carries only the username and expiry
          timestamp, which is enough for the Angular app to display session state
          without ever touching the token itself.
        </p>
        <div key={'Login Cookie'} className="order-2 lg:row-span-4 lg:col-start-2 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: loginCookie}}
        />
        <p className="indent-10 order-3 lg:col-start-1">
          Input validation runs before either controller sees the request. A shared
          factory function applies the same three rules to any named field: not
          empty, must be a string, and trim whitespace. Validation errors return a 401 before
          the request reaches Passport, so malformed or empty credentials never touch
          the auth logic.
        </p>
        <div key={'Input Validation'} className="order-4 lg:col-start-1 max-w-full rounded-xl
        overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: inputValidation}}
        />
      </div>

      <h3 className="mt-10 text-center">The Angular Side</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 order-1 lg:col-start-1 lg:row-start-1">
          On the Angular side, the httpOnly cookie is invisible to TypeScript.
          The browser sends it automatically on every request, but no application
          code can read or modify it. The JWT interceptor makes this transparent by
          cloning every outgoing request and setting <code>withCredentials: true</code>,
          which instructs the browser to include cookies on cross-origin requests.
          No Authorization header is constructed, no token is retrieved from storage.
        </p>
        <div key={'JWT Interceptor'} className="order-2 lg:col-start-2 lg:row-start-1
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: jwtInterceptor}}
        />
        <p className="indent-10 order-3 lg:col-start-1 lg:row-start-2">
          The alert data service assembles query parameters into an{' '}
          <code>HttpParams</code> object and passes them to the{' '}
          <code>/alerts</code> endpoint. Every parameter is optional. 
          If no category filter or date range is set, those keys are 
          simply absent from the request. This matches the server's aggregation 
          pipeline, which builds the <code>$match</code> stage only from 
          parameters that are actually present.
        </p>
        <div key={'Get Alerts'} className="order-4 lg:col-start-2 lg:row-start-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: getAlerts}}
        />
      </div>

      <h3 className="mt-10 text-center">The Alert Dashboard</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 order-1 lg:col-start-1 lg:row-start-1">
          The alert listing component owns all query state, including the current
          page, limit, sort column, sort order, category filter, and date range. Every user
          interaction updates the relevant field and calls <code>loadAlerts()</code>,
          which rebuilds the params object and fires a new request. The component
          never caches or transforms the server's response. It assigns{' '}
          <code>res.alerts</code> to <code>this.alerts</code> and lets Angular's
          change detection re-render the table.
        </p>
        <div key={'Component State'} className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: componentState}}
        />
        <div key={'Load Alerts'} className="order-3 lg:col-start-1 lg:row-start-2 lg:row-span-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: loadAlerts}}
        />
        <div key={'Handlers'} className="order-4 lg:col-start-2 lg:row-start-3 lg:row-span-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: handlers}}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 my-2 mx-0.5 lg:my-4
      gap-2 lg:gap-4 w-full">
        <p className="indent-10 order-1 lg:col-start-1 lg:row-start-1">
          The table and paginator are Angular Material components. The{' '}
          <code>mat-table</code> binds to <code>alerts</code> as its data source
          and fires a <code>matSortChange</code> event whenever a column header is
          clicked. The paginator is server-side. It reports user interactions via
          the <code>page</code> event, and <code>onPageChange</code> updates
          component state and triggers a new request. The total record count comes
          from the server's <code>$facet</code> metadata, so the paginator displays
          the correct total without loading the entire collection.
        </p>
        <div key={'Mat Table'} className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: matTable}}
        />
        <div key={'Mat Paginator'} className="order-3 lg:col-start-1 lg:row-start-2
        max-w-full rounded-xl overflow-hidden [&>pre]:overflow-x-auto [&>pre]:p-2"
          dangerouslySetInnerHTML={{__html: matPaginator}}
        />
      </div>

      <h3 className="text-center mt-10">Conclusions</h3>
      <div className="flex flex-col items-center">
        <p className="indent-10 lg:max-w-1/2">
          This enhancement demonstrates the ability to design and implement a
          full-stack solution to a real security problem. The aggregation pipeline,
          dual authentication paths, and httpOnly cookie strategy are all decisions
          made from first principles. They were not inherited from the original Travlr
          scaffold. Each one was added because the new problem required it. Repurposing an existing
          application is not the same as copying it. Most of the work was identifying
          which parts of the original design were compatible with the new requirements,
          which parts needed to change, and which needed to be discarded entirely.
        </p>
        <p className="indent-10 lg:max-w-1/2">
          The security decisions in particular reflect a mindset of thinking through
          failure modes before writing code. The httpOnly cookie is the right choice
          not because it is easier than localStorage, but because it removes an entire
          class of attack. The static API key for the Pi is the right choice not
          because it is simpler than OAuth, but because the Pi is not an interactive
          user and adding OAuth complexity would create more attack surface without
          adding meaningful protection. Security decisions made for the wrong reasons,
          like following a tutorial or matching a prior implementation, tend to be wrong.
          Decisions made from an explicit threat model tend to hold up. If you would like 
          to preview the page and the signal flows my IDS system identified you can go <a
          target="_blank" href="https://gadget.joshuashoemaker.me">here</a>. Make an account
          (any old name and password) to see and filter the database. 
        </p>
      </div>

      <h3 className="mt-10">References</h3>
      <p>MongoDB. (2024). <em>Aggregation pipeline</em>. <a target="_blank" href="https://www.mongodb.com/docs/manual/core/aggregation-pipeline/">https://www.mongodb.com/docs/manual/core/aggregation-pipeline/</a></p>
      <p>OWASP. (2021). <em>OWASP Top Ten</em>. <a target="_blank" href="https://owasp.org/www-project-top-ten/">https://owasp.org/www-project-top-ten/</a></p>
      <p>Saintedlama. (2024). <em>passport-local-mongoose</em>. GitHub. <a target="_blank" href="https://github.com/saintedlama/passport-local-mongoose">https://github.com/saintedlama/passport-local-mongoose</a></p>
    </main>
  );
}
