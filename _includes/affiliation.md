<h2 id="affiliations" style="margin: 2px 0px -15px;">Affiliations</h2>

<div class="publications">
<ol class="bibliography">

{% for affiliation in site.data.affiliations.main %}

<li>
<div class="affiliation-row">
  <div class="col-sm-3 abbr" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if affiliation.image %} 
    <img src="{{ affiliation.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
    <div class="name">{{ affiliation.name }}</div>
    <div class="type">{{ affiliation.type }}</div>
    <div class="date"><em>{{ affiliation.date }}</em></div>
  </div>
</div>
</li>

<br>

{% endfor %}

</ol>
</div>
