export default function Home() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Music streaming assignment project</p>
        <h1>Stream, manage, and subscribe with role-based access.</h1>
        <p>Melodique supports Admin, Singer, and User workflows with song management, playlist creation, and premium subscription simulation.</p>
      </div>
      <div className="card stats">
        <h3>Modules included</h3>
        <ul>
          <li>Authentication & authorization</li>
          <li>Admin CRUD and reports</li>
          <li>Singer song upload management</li>
          <li>User browse, search, playlists, payments</li>
        </ul>
      </div>
    </section>
  )
}