(function(a) {
	if (typeof define === "function" && define.amd) {
		define(["jquery"], function(b) {
			a(b, window, document)
		})
	} else {
		if (typeof module === "object" && module.exports) {
			module.exports = a(require("jquery"), window, document)
		} else {
			a(jQuery, window, document)
		}
	}
})(function(a, j, d, i) {
	var h = "countrySelect",
		e = 1,
		c = {
			defaultCountry: "",
			defaultStyling: "inside",
			excludeCountries: [],
			onlyCountries: [],
			preferredCountries: ["us", "gb"],
			responsiveDropdown: (a(j).width() < 768 ? true : false),
		},
		f = {
			UP: 38,
			DOWN: 40,
			ENTER: 13,
			ESC: 27,
			BACKSPACE: 8,
			PLUS: 43,
			SPACE: 32,
			A: 65,
			Z: 90
		},
		k = false;
	a(j).on("load", function() {
		k = true
	});

	function g(l, m) {
		this.element = l;
		this.options = a.extend({}, c, m);
		this._defaults = c;
		this.ns = "." + h + e++;
		this._name = h;
		this.init()
	}
	g.prototype = {
		init: function() {
			this._processCountryData();
			this._generateMarkup();
			this._setInitialState();
			this._initListeners();
			this.autoCountryDeferred = new a.Deferred();
			this._initAutoCountry();
			this.typedLetters = "";
			return this.autoCountryDeferred
		},
		_processCountryData: function() {
			this._setInstanceCountryData();
			this._setPreferredCountries()
		},
		_setInstanceCountryData: function() {
			var n = this;
			if (this.options.onlyCountries.length) {
				var m = [];
				a.each(this.options.onlyCountries, function(q, o) {
					var p = n._getCountryData(o, true);
					if (p) {
						m.push(p)
					}
				});
				this.countries = m
			} else {
				if (this.options.excludeCountries.length) {
					var l = this.options.excludeCountries.map(function(o) {
						return o.toLowerCase()
					});
					this.countries = b.filter(function(o) {
						return l.indexOf(o.iso2) === -1
					})
				} else {
					this.countries = b
				}
			}
		},
		_setPreferredCountries: function() {
			var l = this;
			this.preferredCountries = [];
			a.each(this.options.preferredCountries, function(o, m) {
				var n = l._getCountryData(m, false);
				if (n) {
					l.preferredCountries.push(n)
				}
			})
		},
		_generateMarkup: function() {
			this.countryInput = a(this.element);
			var m = "country-select";
			if (this.options.defaultStyling) {
				m += " " + this.options.defaultStyling
			}
			this.countryInput.wrap(a("<div>", {
				"class": m
			}));
			var l = a("<div>", {
				"class": "flag-dropdown"
			}).insertAfter(this.countryInput);
			var n = a("<div>", {
				"class": "selected-flag"
			}).appendTo(l);
			this.selectedFlagInner = a("<div>", {
				"class": "flag"
			}).appendTo(n);
			a("<div>", {
				"class": "arrow"
			}).appendTo(n);
			this.countryList = a("<ul>", {
				"class": "country-list v-hide"
			}).appendTo(l);
			if (this.preferredCountries.length) {
				this._appendListItems(this.preferredCountries, "preferred");
				a("<li>", {
					"class": "divider"
				}).appendTo(this.countryList)
			}
			this._appendListItems(this.countries, "");
			this.countryCodeInput = a("#" + this.countryInput.attr("id") + "_code");
			if (!this.countryCodeInput) {
				this.countryCodeInput = a('<input type="hidden" id="' + this.countryInput.attr("id") + '_code" name="' + this.countryInput.attr("name") + '_code" value="" />');
				this.countryCodeInput.insertAfter(this.countryInput)
			}
			this.dropdownHeight = this.countryList.outerHeight();
			if (this.options.responsiveDropdown) {
				a(j).resize(function() {
					a(".country-select").each(function() {
						var o = this.offsetWidth;
						a(this).find(".country-list").css("width", o + "px")
					})
				}).resize()
			}
			this.countryList.removeClass("v-hide").addClass("hide");
			this.countryListItems = this.countryList.children(".country")
		},
		_appendListItems: function(m, l) {
			var n = "";
			a.each(m, function(p, o) {
				n += '<li class="country ' + l + '" data-country-code="' + o.iso2 + '">';
				n += '<div class="flag ' + o.iso2 + '"></div>';
				n += '<span class="country-name">' + o.name + "</span>";
				n += "</li>"
			});
			this.countryList.append(n)
		},
		_setInitialState: function() {
			var m = false;
			if (this.countryInput.val()) {
				m = this._updateFlagFromInputVal()
			}
			var n = this.countryCodeInput.val();
			if (n) {
				this.selectCountry(n)
			}
			if (!m) {
				var l;
				if (this.options.defaultCountry) {
					l = this._getCountryData(this.options.defaultCountry, false);
					if (!l) {
						l = this.preferredCountries.length ? this.preferredCountries[0] : this.countries[0]
					}
				} else {
					l = this.preferredCountries.length ? this.preferredCountries[0] : this.countries[0]
				}
				this.defaultCountry = l.iso2
			}
		},
		_initListeners: function() {
			var m = this;
			this.countryInput.on("keyup" + this.ns, function() {
				m._updateFlagFromInputVal()
			});
			var l = this.selectedFlagInner.parent();
			l.on("click" + this.ns, function(n) {
				if (m.countryList.hasClass("hide") && !m.countryInput.prop("disabled")) {
					m._showDropdown()
				}
			});
			this.countryInput.on("blur" + this.ns, function() {
				if (m.countryInput.val() != m.getSelectedCountryData().name) {
					m.setCountry(m.countryInput.val())
				}
				m.countryInput.val(m.getSelectedCountryData().name)
			})
		},
		_initAutoCountry: function() {
			if (this.options.initialCountry === "auto") {
				this._loadAutoCountry()
			} else {
				if (this.defaultCountry) {
					this.selectCountry(this.defaultCountry)
				}
				this.autoCountryDeferred.resolve()
			}
		},
		_loadAutoCountry: function() {
			var l = this;
			if (a.fn[h].autoCountry) {
				this.handleAutoCountry()
			} else {
				if (!a.fn[h].startedLoadingAutoCountry) {
					a.fn[h].startedLoadingAutoCountry = true;
					if (typeof this.options.geoIpLookup === "function") {
						this.options.geoIpLookup(function(m) {
							a.fn[h].autoCountry = m.toLowerCase();
							setTimeout(function() {
								a(".country-select input").countrySelect("handleAutoCountry")
							})
						})
					}
				}
			}
		},
		_focus: function() {
			this.countryInput.focus();
			var l = this.countryInput[0];
			if (l.setSelectionRange) {
				var m = this.countryInput.val().length;
				l.setSelectionRange(m, m)
			}
		},
		_showDropdown: function() {
			this._setDropdownPosition();
			var l = this.countryList.children(".active");
			this._highlightListItem(l);
			this.countryList.removeClass("hide");
			this._scrollTo(l);
			this._bindDropdownListeners();
			this.selectedFlagInner.parent().children(".arrow").addClass("up")
		},
		_setDropdownPosition: function() {
			var o = this.countryInput.offset().top,
				p = a(j).scrollTop(),
				n = o + this.countryInput.outerHeight() + this.dropdownHeight < p + a(j).height(),
				m = o - this.dropdownHeight > p;
			var l = !n && m ? "-" + (this.dropdownHeight - 1) + "px" : "";
			this.countryList.css("top", l)
		},
		_bindDropdownListeners: function() {
			var m = this;
			this.countryList.on("mouseover" + this.ns, ".country", function(n) {
				m._highlightListItem(a(this))
			});
			this.countryList.on("click" + this.ns, ".country", function(n) {
				m._selectListItem(a(this))
			});
			var l = true;
			a("html").on("click" + this.ns, function(n) {
				n.preventDefault();
				if (!l) {
					m._closeDropdown()
				}
				l = false
			});
			a(d).on("keydown" + this.ns, function(n) {
				n.preventDefault();
				if (n.which == f.UP || n.which == f.DOWN) {
					m._handleUpDownKey(n.which)
				} else {
					if (n.which == f.ENTER) {
						m._handleEnterKey()
					} else {
						if (n.which == f.ESC) {
							m._closeDropdown()
						} else {
							if (n.which >= f.A && n.which <= f.Z || n.which === f.SPACE) {
								m.typedLetters += String.fromCharCode(n.which);
								m._filterCountries(m.typedLetters)
							} else {
								if (n.which === f.BACKSPACE) {
									m.typedLetters = m.typedLetters.slice(0, -1);
									m._filterCountries(m.typedLetters)
								}
							}
						}
					}
				}
			})
		},
		_handleUpDownKey: function(m) {
			var l = this.countryList.children(".highlight").first();
			var n = m == f.UP ? l.prev() : l.next();
			if (n.length) {
				if (n.hasClass("divider")) {
					n = m == f.UP ? n.prev() : n.next()
				}
				this._highlightListItem(n);
				this._scrollTo(n)
			}
		},
		_handleEnterKey: function() {
			var l = this.countryList.children(".highlight").first();
			if (l.length) {
				this._selectListItem(l)
			}
		},
		_filterCountries: function(n) {
			var l = this.countryListItems.filter(function() {
				return a(this).text().toUpperCase().indexOf(n) === 0 && !a(this).hasClass("preferred")
			});
			if (l.length) {
				var m = l.filter(".highlight").first(),
					o;
				if (m && m.next() && m.next().text().toUpperCase().indexOf(n) === 0) {
					o = m.next()
				} else {
					o = l.first()
				}
				this._highlightListItem(o);
				this._scrollTo(o)
			}
		},
		_updateFlagFromInputVal: function() {
			var p = this;
			var q = this.countryInput.val().replace(/(?=[() ])/g, "\\");
			if (q) {
				var m = [];
				var o = new RegExp("^" + q, "i");
				for (var n = 0; n < this.countries.length; n++) {
					if (this.countries[n].name.match(o)) {
						m.push(this.countries[n].iso2)
					}
				}
				var l = false;
				a.each(m, function(s, r) {
					if (p.selectedFlagInner.hasClass(r)) {
						l = true
					}
				});
				if (!l) {
					this._selectFlag(m[0]);
					this.countryCodeInput.val(m[0]).trigger("change")
				}
				return true
			}
			return false
		},
		_highlightListItem: function(l) {
			this.countryListItems.removeClass("highlight");
			l.addClass("highlight")
		},
		_getCountryData: function(l, o) {
			var m = o ? b : this.countries;
			for (var n = 0; n < m.length; n++) {
				if (m[n].iso2 == l) {
					return m[n]
				}
			}
			return null
		},
		_selectFlag: function(l) {
			if (!l) {
				return false
			}
			this.selectedFlagInner.attr("class", "flag " + l);
			var m = this._getCountryData(l);
			this.selectedFlagInner.parent().attr("title", m.name);
			var n = this.countryListItems.children(".flag." + l).first().parent();
			this.countryListItems.removeClass("active");
			n.addClass("active")
		},
		_selectListItem: function(m) {
			var l = m.attr("data-country-code");
			this._selectFlag(l);
			this._closeDropdown();
			this._updateName(l);
			this.countryInput.trigger("change");
			this.countryCodeInput.trigger("change");
			this._focus()
		},
		_closeDropdown: function() {
			this.countryList.addClass("hide");
			this.selectedFlagInner.parent().children(".arrow").removeClass("up");
			a(d).off("keydown" + this.ns);
			a("html").off("click" + this.ns);
			this.countryList.off(this.ns);
			this.typedLetters = ""
		},
		_scrollTo: function(p) {
			if (!p || !p.offset()) {
				return
			}
			var l = this.countryList,
				n = l.height(),
				o = l.offset().top,
				m = o + n,
				r = p.outerHeight(),
				s = p.offset().top,
				q = s + r,
				u = s - o + l.scrollTop();
			if (s < o) {
				l.scrollTop(u)
			} else {
				if (q > m) {
					var t = n - r;
					l.scrollTop(u - t)
				}
			}
		},
		_updateName: function(l) {
			this.countryCodeInput.val(l).trigger("change");
			this.countryInput.val(this._getCountryData(l).name)
		},
		handleAutoCountry: function() {
			if (this.options.initialCountry === "auto") {
				this.defaultCountry = a.fn[h].autoCountry;
				if (!this.countryInput.val()) {
					this.selectCountry(this.defaultCountry)
				}
				this.autoCountryDeferred.resolve()
			}
		},
		getSelectedCountryData: function() {
			var l = this.selectedFlagInner.attr("class").split(" ")[1];
			return this._getCountryData(l)
		},
		selectCountry: function(l) {
			l = l.toLowerCase();
			if (!this.selectedFlagInner.hasClass(l)) {
				this._selectFlag(l);
				this._updateName(l)
			}
		},
		setCountry: function(l) {
			this.countryInput.val(l);
			this._updateFlagFromInputVal()
		},
		destroy: function() {
			this.countryInput.off(this.ns);
			this.selectedFlagInner.parent().off(this.ns);
			var l = this.countryInput.parent();
			l.before(this.countryInput).remove()
		}
	};
	a.fn[h] = function(m) {
		var l = arguments;
		if (m === i || typeof m === "object") {
			return this.each(function() {
				if (!a.data(this, "plugin_" + h)) {
					a.data(this, "plugin_" + h, new g(this, m))
				}
			})
		} else {
			if (typeof m === "string" && m[0] !== "_" && m !== "init") {
				var n;
				this.each(function() {
					var o = a.data(this, "plugin_" + h);
					if (o instanceof g && typeof o[m] === "function") {
						n = o[m].apply(o, Array.prototype.slice.call(l, 1))
					}
					if (m === "destroy") {
						a.data(this, "plugin_" + h, null)
					}
				});
				return n !== i ? n : this
			}
		}
	};
	a.fn[h].getCountryData = function() {
		return b
	};
	a.fn[h].setCountryData = function(l) {
		b = l
	};
	var b = a.each([{
		n: "Afghanistan (افغانستان)",
		i: "af"
	}, {
		n: "Åland Islands (Åland)",
		i: "ax"
	}, {
		n: "Albania (Shqipëri)",
		i: "al"
	}, {
		n: "Algeria (الجزائر)",
		i: "dz"
	}, {
		n: "American Samoa",
		i: "as"
	}, {
		n: "Andorra",
		i: "ad"
	}, {
		n: "Angola",
		i: "ao"
	}, {
		n: "Anguilla",
		i: "ai"
	}, {
		n: "Antigua and Barbuda",
		i: "ag"
	}, {
		n: "Argentina",
		i: "ar"
	}, {
		n: "Armenia (Հայաստան)",
		i: "am"
	}, {
		n: "Aruba",
		i: "aw"
	}, {
		n: "Australia",
		i: "au"
	}, {
		n: "Austria (Österreich)",
		i: "at"
	}, {
		n: "Azerbaijan (Azərbaycan)",
		i: "az"
	}, {
		n: "Bahamas",
		i: "bs"
	}, {
		n: "Bahrain (البحرين)",
		i: "bh"
	}, {
		n: "Bangladesh (বাংলাদেশ)",
		i: "bd"
	}, {
		n: "Barbados",
		i: "bb"
	}, {
		n: "Belarus (Беларусь)",
		i: "by"
	}, {
		n: "Belgium (België)",
		i: "be"
	}, {
		n: "Belize",
		i: "bz"
	}, {
		n: "Benin (Bénin)",
		i: "bj"
	}, {
		n: "Bermuda",
		i: "bm"
	}, {
		n: "Bhutan (འབྲུག)",
		i: "bt"
	}, {
		n: "Bolivia",
		i: "bo"
	}, {
		n: "Bosnia and Herzegovina (Босна и Херцеговина)",
		i: "ba"
	}, {
		n: "Botswana",
		i: "bw"
	}, {
		n: "Brazil (Brasil)",
		i: "br"
	}, {
		n: "British Indian Ocean Territory",
		i: "io"
	}, {
		n: "British Virgin Islands",
		i: "vg"
	}, {
		n: "Brunei",
		i: "bn"
	}, {
		n: "Bulgaria (България)",
		i: "bg"
	}, {
		n: "Burkina Faso",
		i: "bf"
	}, {
		n: "Burundi (Uburundi)",
		i: "bi"
	}, {
		n: "Cambodia (កម្ពុជា)",
		i: "kh"
	}, {
		n: "Cameroon (Cameroun)",
		i: "cm"
	}, {
		n: "Canada",
		i: "ca"
	}, {
		n: "Cape Verde (Kabu Verdi)",
		i: "cv"
	}, {
		n: "Caribbean Netherlands",
		i: "bq"
	}, {
		n: "Cayman Islands",
		i: "ky"
	}, {
		n: "Central African Republic (République Centrafricaine)",
		i: "cf"
	}, {
		n: "Chad (Tchad)",
		i: "td"
	}, {
		n: "Chile",
		i: "cl"
	}, {
		n: "China (中国)",
		i: "cn"
	}, {
		n: "Christmas Island",
		i: "cx"
	}, {
		n: "Cocos (Keeling) Islands (Kepulauan Cocos (Keeling))",
		i: "cc"
	}, {
		n: "Colombia",
		i: "co"
	}, {
		n: "Comoros (جزر القمر)",
		i: "km"
	}, {
		n: "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)",
		i: "cd"
	}, {
		n: "Congo (Republic) (Congo-Brazzaville)",
		i: "cg"
	}, {
		n: "Cook Islands",
		i: "ck"
	}, {
		n: "Costa Rica",
		i: "cr"
	}, {
		n: "Côte d’Ivoire",
		i: "ci"
	}, {
		n: "Croatia (Hrvatska)",
		i: "hr"
	}, {
		n: "Cuba",
		i: "cu"
	}, {
		n: "Curaçao",
		i: "cw"
	}, {
		n: "Cyprus (Κύπρος)",
		i: "cy"
	}, {
		n: "Czech Republic (Česká republika)",
		i: "cz"
	}, {
		n: "Denmark (Danmark)",
		i: "dk"
	}, {
		n: "Djibouti",
		i: "dj"
	}, {
		n: "Dominica",
		i: "dm"
	}, {
		n: "Dominican Republic (República Dominicana)",
		i: "do"
	}, {
		n: "Ecuador",
		i: "ec"
	}, {
		n: "Egypt (مصر)",
		i: "eg"
	}, {
		n: "El Salvador",
		i: "sv"
	}, {
		n: "Equatorial Guinea (Guinea Ecuatorial)",
		i: "gq"
	}, {
		n: "Eritrea",
		i: "er"
	}, {
		n: "Estonia (Eesti)",
		i: "ee"
	}, {
		n: "Ethiopia",
		i: "et"
	}, {
		n: "Falkland Islands (Islas Malvinas)",
		i: "fk"
	}, {
		n: "Faroe Islands (Føroyar)",
		i: "fo"
	}, {
		n: "Fiji",
		i: "fj"
	}, {
		n: "Finland (Suomi)",
		i: "fi"
	}, {
		n: "France",
		i: "fr"
	}, {
		n: "French Guiana (Guyane française)",
		i: "gf"
	}, {
		n: "French Polynesia (Polynésie française)",
		i: "pf"
	}, {
		n: "Gabon",
		i: "ga"
	}, {
		n: "Gambia",
		i: "gm"
	}, {
		n: "Georgia (საქართველო)",
		i: "ge"
	}, {
		n: "Germany (Deutschland)",
		i: "de"
	}, {
		n: "Ghana (Gaana)",
		i: "gh"
	}, {
		n: "Gibraltar",
		i: "gi"
	}, {
		n: "Greece (Ελλάδα)",
		i: "gr"
	}, {
		n: "Greenland (Kalaallit Nunaat)",
		i: "gl"
	}, {
		n: "Grenada",
		i: "gd"
	}, {
		n: "Guadeloupe",
		i: "gp"
	}, {
		n: "Guam",
		i: "gu"
	}, {
		n: "Guatemala",
		i: "gt"
	}, {
		n: "Guernsey",
		i: "gg"
	}, {
		n: "Guinea (Guinée)",
		i: "gn"
	}, {
		n: "Guinea-Bissau (Guiné Bissau)",
		i: "gw"
	}, {
		n: "Guyana",
		i: "gy"
	}, {
		n: "Haiti",
		i: "ht"
	}, {
		n: "Honduras",
		i: "hn"
	}, {
		n: "Hong Kong (香港)",
		i: "hk"
	}, {
		n: "Hungary (Magyarország)",
		i: "hu"
	}, {
		n: "Iceland (Ísland)",
		i: "is"
	}, {
		n: "India (भारत)",
		i: "in"
	}, {
		n: "Indonesia",
		i: "id"
	}, {
		n: "Iran (ایران)",
		i: "ir"
	}, {
		n: "Iraq (العراق)",
		i: "iq"
	}, {
		n: "Ireland",
		i: "ie"
	}, {
		n: "Isle of Man",
		i: "im"
	}, {
		n: "Israel (ישראל)",
		i: "il"
	}, {
		n: "Italy (Italia)",
		i: "it"
	}, {
		n: "Jamaica",
		i: "jm"
	}, {
		n: "Japan (日本)",
		i: "jp"
	}, {
		n: "Jersey",
		i: "je"
	}, {
		n: "Jordan (الأردن)",
		i: "jo"
	}, {
		n: "Kazakhstan (Казахстан)",
		i: "kz"
	}, {
		n: "Kenya",
		i: "ke"
	}, {
		n: "Kiribati",
		i: "ki"
	}, {
		n: "Kosovo (Kosovë)",
		i: "xk"
	}, {
		n: "Kuwait (الكويت)",
		i: "kw"
	}, {
		n: "Kyrgyzstan (Кыргызстан)",
		i: "kg"
	}, {
		n: "Laos (ລາວ)",
		i: "la"
	}, {
		n: "Latvia (Latvija)",
		i: "lv"
	}, {
		n: "Lebanon (لبنان)",
		i: "lb"
	}, {
		n: "Lesotho",
		i: "ls"
	}, {
		n: "Liberia",
		i: "lr"
	}, {
		n: "Libya (ليبيا)",
		i: "ly"
	}, {
		n: "Liechtenstein",
		i: "li"
	}, {
		n: "Lithuania (Lietuva)",
		i: "lt"
	}, {
		n: "Luxembourg",
		i: "lu"
	}, {
		n: "Macau (澳門)",
		i: "mo"
	}, {
		n: "Macedonia (FYROM) (Македонија)",
		i: "mk"
	}, {
		n: "Madagascar (Madagasikara)",
		i: "mg"
	}, {
		n: "Malawi",
		i: "mw"
	}, {
		n: "Malaysia",
		i: "my"
	}, {
		n: "Maldives",
		i: "mv"
	}, {
		n: "Mali",
		i: "ml"
	}, {
		n: "Malta",
		i: "mt"
	}, {
		n: "Marshall Islands",
		i: "mh"
	}, {
		n: "Martinique",
		i: "mq"
	}, {
		n: "Mauritania (موريتانيا)",
		i: "mr"
	}, {
		n: "Mauritius (Moris)",
		i: "mu"
	}, {
		n: "Mayotte",
		i: "yt"
	}, {
		n: "Mexico (México)",
		i: "mx"
	}, {
		n: "Micronesia",
		i: "fm"
	}, {
		n: "Moldova (Republica Moldova)",
		i: "md"
	}, {
		n: "Monaco",
		i: "mc"
	}, {
		n: "Mongolia (Монгол)",
		i: "mn"
	}, {
		n: "Montenegro (Crna Gora)",
		i: "me"
	}, {
		n: "Montserrat",
		i: "ms"
	}, {
		n: "Morocco (المغرب)",
		i: "ma"
	}, {
		n: "Mozambique (Moçambique)",
		i: "mz"
	}, {
		n: "Myanmar (Burma) (မြန်မာ)",
		i: "mm"
	}, {
		n: "Namibia (Namibië)",
		i: "na"
	}, {
		n: "Nauru",
		i: "nr"
	}, {
		n: "Nepal (नेपाल)",
		i: "np"
	}, {
		n: "Netherlands (Nederland)",
		i: "nl"
	}, {
		n: "New Caledonia (Nouvelle-Calédonie)",
		i: "nc"
	}, {
		n: "New Zealand",
		i: "nz"
	}, {
		n: "Nicaragua",
		i: "ni"
	}, {
		n: "Niger (Nijar)",
		i: "ne"
	}, {
		n: "Nigeria",
		i: "ng"
	}, {
		n: "Niue",
		i: "nu"
	}, {
		n: "Norfolk Island",
		i: "nf"
	}, {
		n: "North Korea (조선 민주주의 인민 공화국)",
		i: "kp"
	}, {
		n: "Northern Mariana Islands",
		i: "mp"
	}, {
		n: "Norway (Norge)",
		i: "no"
	}, {
		n: "Oman (عُمان)",
		i: "om"
	}, {
		n: "Pakistan (پاکستان)",
		i: "pk"
	}, {
		n: "Palau",
		i: "pw"
	}, {
		n: "Palestine (فلسطين)",
		i: "ps"
	}, {
		n: "Panama (Panamá)",
		i: "pa"
	}, {
		n: "Papua New Guinea",
		i: "pg"
	}, {
		n: "Paraguay",
		i: "py"
	}, {
		n: "Peru (Perú)",
		i: "pe"
	}, {
		n: "Philippines",
		i: "ph"
	}, {
		n: "Pitcairn Islands",
		i: "pn"
	}, {
		n: "Poland (Polska)",
		i: "pl"
	}, {
		n: "Portugal",
		i: "pt"
	}, {
		n: "Puerto Rico",
		i: "pr"
	}, {
		n: "Qatar (قطر)",
		i: "qa"
	}, {
		n: "Réunion (La Réunion)",
		i: "re"
	}, {
		n: "Romania (România)",
		i: "ro"
	}, {
		n: "Russia (Россия)",
		i: "ru"
	}, {
		n: "Rwanda",
		i: "rw"
	}, {
		n: "Saint Barthélemy (Saint-Barthélemy)",
		i: "bl"
	}, {
		n: "Saint Helena",
		i: "sh"
	}, {
		n: "Saint Kitts and Nevis",
		i: "kn"
	}, {
		n: "Saint Lucia",
		i: "lc"
	}, {
		n: "Saint Martin (Saint-Martin (partie française))",
		i: "mf"
	}, {
		n: "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)",
		i: "pm"
	}, {
		n: "Saint Vincent and the Grenadines",
		i: "vc"
	}, {
		n: "Samoa",
		i: "ws"
	}, {
		n: "San Marino",
		i: "sm"
	}, {
		n: "São Tomé and Príncipe (São Tomé e Príncipe)",
		i: "st"
	}, {
		n: "Saudi Arabia (المملكة العربية السعودية)",
		i: "sa"
	}, {
		n: "Senegal (Sénégal)",
		i: "sn"
	}, {
		n: "Serbia (Србија)",
		i: "rs"
	}, {
		n: "Seychelles",
		i: "sc"
	}, {
		n: "Sierra Leone",
		i: "sl"
	}, {
		n: "Singapore",
		i: "sg"
	}, {
		n: "Sint Maarten",
		i: "sx"
	}, {
		n: "Slovakia (Slovensko)",
		i: "sk"
	}, {
		n: "Slovenia (Slovenija)",
		i: "si"
	}, {
		n: "Solomon Islands",
		i: "sb"
	}, {
		n: "Somalia (Soomaaliya)",
		i: "so"
	}, {
		n: "South Africa",
		i: "za"
	}, {
		n: "South Georgia & South Sandwich Islands",
		i: "gs"
	}, {
		n: "South Korea (대한민국)",
		i: "kr"
	}, {
		n: "South Sudan (جنوب السودان)",
		i: "ss"
	}, {
		n: "Spain (España)",
		i: "es"
	}, {
		n: "Sri Lanka (ශ්රී ලංකාව)",
		i: "lk"
	}, {
		n: "Sudan (السودان)",
		i: "sd"
	}, {
		n: "Suriname",
		i: "sr"
	}, {
		n: "Svalbard and Jan Mayen (Svalbard og Jan Mayen)",
		i: "sj"
	}, {
		n: "Swaziland",
		i: "sz"
	}, {
		n: "Sweden (Sverige)",
		i: "se"
	}, {
		n: "Switzerland (Schweiz)",
		i: "ch"
	}, {
		n: "Syria (سوريا)",
		i: "sy"
	}, {
		n: "Taiwan (台灣)",
		i: "tw"
	}, {
		n: "Tajikistan",
		i: "tj"
	}, {
		n: "Tanzania",
		i: "tz"
	}, {
		n: "Thailand (ไทย)",
		i: "th"
	}, {
		n: "Timor-Leste",
		i: "tl"
	}, {
		n: "Togo",
		i: "tg"
	}, {
		n: "Tokelau",
		i: "tk"
	}, {
		n: "Tonga",
		i: "to"
	}, {
		n: "Trinidad and Tobago",
		i: "tt"
	}, {
		n: "Tunisia (تونس)",
		i: "tn"
	}, {
		n: "Turkey (Türkiye)",
		i: "tr"
	}, {
		n: "Turkmenistan",
		i: "tm"
	}, {
		n: "Turks and Caicos Islands",
		i: "tc"
	}, {
		n: "Tuvalu",
		i: "tv"
	}, {
		n: "Uganda",
		i: "ug"
	}, {
		n: "Ukraine (Україна)",
		i: "ua"
	}, {
		n: "United Arab Emirates (الإمارات العربية المتحدة)",
		i: "ae"
	}, {
		n: "United Kingdom",
		i: "gb"
	}, {
		n: "United States",
		i: "us"
	}, {
		n: "U.S. Minor Outlying Islands",
		i: "um"
	}, {
		n: "U.S. Virgin Islands",
		i: "vi"
	}, {
		n: "Uruguay",
		i: "uy"
	}, {
		n: "Uzbekistan (Oʻzbekiston)",
		i: "uz"
	}, {
		n: "Vanuatu",
		i: "vu"
	}, {
		n: "Vatican City (Città del Vaticano)",
		i: "va"
	}, {
		n: "Venezuela",
		i: "ve"
	}, {
		n: "Vietnam (Việt Nam)",
		i: "vn"
	}, {
		n: "Wallis and Futuna",
		i: "wf"
	}, {
		n: "Western Sahara (الصحراء الغربية)",
		i: "eh"
	}, {
		n: "Yemen (اليمن)",
		i: "ye"
	}, {
		n: "Zambia",
		i: "zm"
	}, {
		n: "Zimbabwe",
		i: "zw"
	}], function(m, l) {
		l.name = l.n;
		l.iso2 = l.i;
		delete l.n;
		delete l.i
	})
});