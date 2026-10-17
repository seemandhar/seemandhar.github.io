<h2 id="affiliations" style="margin: 2px 0px -15px;">Affiliations</h2>

<div class="affil-grid">
{% for affiliation in site.data.affiliations.main %}
<div class="affil-card">
  <div class="affil-logo">
    {% if affiliation.image %}<img src="{{ affiliation.image }}" alt="{{ affiliation.name }} logo" loading="lazy">{% endif %}
  </div>
  <div class="affil-body">
    <div class="affil-name">{{ affiliation.name }}</div>
    <div class="affil-role">{{ affiliation.type }}</div>
    <div class="affil-date">{{ affiliation.date }}</div>
  </div>
</div>
{% endfor %}
</div>
