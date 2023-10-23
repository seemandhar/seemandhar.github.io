<h2 id="affiliations" style="margin: 2px 0px -15px;">Affiliations</h2>

<div style="margin: 20px 0;">
<ol style="list-style: none; padding-left: 0;">

{% for affiliation in site.data.affiliations.main %}

<li style="margin-bottom: 15px;">
  <div style="display: flex; align-items: center; justify-content: start;">
    <div style="flex: 0 0 20%; margin-right: 15px; position: relative;">
      {% if affiliation.image %} 
      <img src="{{ affiliation.image }}" style="width: 100%; height: auto; border-radius: 8px;">
      {% endif %}
    </div>
    <div style="flex: 1; position: relative;">
      <div style="font-weight: 600;">{{ affiliation.name }}</div>
      <div style="color: #555;">{{ affiliation.type }}</div>
      <div style="font-style: italic; color: #666;">{{ affiliation.date }}</div>
    </div>
  </div>
</li>

{% endfor %}

</ol>
</div>
