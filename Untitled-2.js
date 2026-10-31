$(document).ready(function() {
    let ileKlikniec = 0;
    let silaKlikniecia = 1;
    let autoKlikacze = 0;
    let kosztSila = 10;
    let kosztMoc10 = 150;
    let kosztMoc100 = 1500;
    
    let nickGracza = localStorage.getItem('kliker_nick') || 'Gracz1';
    let najlepszyWynik = parseInt(localStorage.getItem('kliker_rekord')) || 0;
    let ranking = JSON.parse(localStorage.getItem('kliker_ranking')) || [];
    
    let ostatniSprawdzonyProgRuletki = 0;

   
    let wybranySBR = null;
    let wTrakcieWysciguSBR = false;
    let licznikPrzegranychSBR = 0;
    let czyJestWAlternatywnymUniwersum = false;
    
    
    let audioSBRMuzyka = new Audio('Johnny Theme _Jojo_s Bizarre Adventure_ Steel Ball Run_ Trailer Song_1.mp3');
    audioSBRMuzyka.loop = true;

   
    let audioMuzyka10k = new Audio('Bandera_1 (1).mp3');
    audioMuzyka10k.loop = true;

    
    let audioMuzykaAU = new Audio(''); 
    audioMuzykaAU.loop = true;

   
    let audioAUValentine = new Audio('D4C Funny Valentine Animation _ SBR_1.mp3'); 

    // Ścieżka dźwiękowa przy ucieczce z AU (Johnny Joestar)
    let audioUcieczkaJohnny = new Audio('Arigato_1.mp3');

    // Progi obrazków w GŁÓWNYM ŚWIECIE (11 poziomów)
    const progiObrazkowGlownych = [
        { prog: 0,      url: 'malymeksykaniec.jpg', nazwa: 'Nielegalny Imigrant z Meksyku' },
        { prog: 200,    url: 'meksykanka.jpg', nazwa: 'Nielegalna Imigrantka z Meksyku' },
        { prog: 500,    url: 'George_Floyd.jpg', nazwa: 'Fentanylowy Zbrodniarz' },
        { prog: 1000,   url: 'whoopie.jpg', nazwa: 'Czarnoskóra Kobieta' },
        { prog: 2000,   url: 'indianin.jpg', nazwa: 'Brudas' },
        { prog: 5000,   url: 'Old_Indian_woman_with_a_sari.jpg', nazwa: 'Kobieta brudas' },
        { prog: 10000,  url: 'swine.jpg', nazwa: 'Ukrainiec' },
        { prog: 20000,  url: 'bandera.jpg', nazwa: 'Ciota' },
        { prog: 50000,  url: 'jew.jpg', nazwa: 'Żyd' },
        { prog: 100000, url: 'captainisrael.jpg', nazwa: 'Kapitan Izrael' },
        { prog: 250000, url: 'bigyahu.jpg', nazwa: 'Big Yahu' }
    ];

    // Progi obrazków w ALTERNATYWNYM UNIWERSUM (AU) - 11 poziomów
    const progiObrazkowAU = [
        { prog: 0,      url: 'drug-war-chicago_camp.jpg', nazwa: 'AU: Meksykański kartel' },
        { prog: 200,    url: 'Pablo_Escobar_Mug.jpg', nazwa: 'AU: Pablo Escobar' },
        { prog: 500,    url: 'derek.jpg', nazwa: 'AU: Derek Chauvin' },
        { prog: 1000,   url: 'Saddam_Hussein_at_trial,_July_2004.jpg', nazwa: 'AU: Saddam Hussein' },
        { prog: 2000,   url: 'mao.jpg', nazwa: 'AU: Mao Zedong' },
        { prog: 5000,   url: 'polpot.jpg', nazwa: 'AU: Pol Pot' },
        { prog: 10000,  url: 'Enver_Pasha_1911.jpg', nazwa: 'AU: Ismail Enver Pasza' },
        { prog: 20000,  url: 'Volodymyr_Zelensky_2022_official_portrait_(cropped).jpg', nazwa: 'AU: Zelensky' },
        { prog: 50000,  url: 'putin.jpg', nazwa: 'AU: Władimir Putin' },
        { prog: 100000, url: 'stalin.jpg', nazwa: 'AU: Józef Stalin' },
        { prog: 250000, url: 'b765760e5a9a57ba802756e1e01b.jpg', nazwa: 'AU: Adolf Hitler' }
    ];

    let aktualnyIndeksProgu = -1;

    $('#nick-gracza').val(nickGracza);
    $('#najlepszy-wynik').text(najlepszyWynik);
    odswiezTabeleWynikow();

    if ($('#konteneranimacji-ruletki').length === 0) {
        $('body').append('<div id="konteneranimacji-ruletki" style="position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:9999;"></div>');
    }

    $('#nick-gracza').on('input', function() {
        nickGracza = $(this).val().trim() || 'Gracz1';
        localStorage.setItem('kliker_nick', nickGracza);
    });

    $('#obszar').on('mouseenter', function() {
        $('.status').hide();
        $('.status').eq(0).css('display', 'inline');
    });

    $('#obszar').on('mouseleave', function() {
        $('.status').hide();
        $('.status').eq(1).css('display', 'inline');
    });

    // KLIKNIĘCIE W OBSZAR GRY
    $('#obszar').on('click', function(e) {
        dodajPunkty(silaKlikniecia);

        let audioKlik = new Audio('Strzal_1 (1).mp3');
        audioKlik.play().catch(e => console.log("Autoplay dźwięku kliknięcia zablokowany"));

        $('.status').hide();
        $('.status').eq(2).css('display', 'inline');

        pokaźAnimacjePlus(e);
    });

    function dodajPunkty(ilosc) {
        ileKlikniec += ilosc;
        
        $('#glowny-licznik').text(ileKlikniec);
        $('#licznik').text(ileKlikniec);

        sprawdzObrazekIPoziom();
        sprawdzCoKolejneProgi();
        sprawdzTlo();
        sprawdzIRozszerzRekord();
        aktualizujSklep();
    }

    // --- OBSŁUGA MINIGRY SBR DLA 10 JEŹDŹCÓW ---
    $('.btn-sbr-faworyt').on('click', function() {
        if (wTrakcieWysciguSBR) return;
        
        wybranySBR = parseInt($(this).data('wybor'));
        $('.btn-sbr-faworyt').css({ 'border-color': 'transparent', 'background-color': '#900bdd' });
        $(this).css({ 'border-color': '#ffcc00', 'background-color': '#b14def' });
        
        let imiona = [
            '', 'Johnny Joestar', 'Gyro Zeppeli', 'Diego Brando', 'Hot Pants', 
            'Ringo Roadagain', 'Mountain Tim', 'Wekapipo', 'Pocoloco', 'Sandman', 'Norisuke Higashikata'
        ];
        $('#sbr-status').text('Wybrano: ' + imiona[wybranySBR]);
    });

    $('#sbr-start').on('click', function() {
        if (wTrakcieWysciguSBR) return;
        
        if (!wybranySBR) {
            $('#sbr-status').text('Wybierz najpierw swojego jeźdźca!');
            return;
        }

        let wpisowe = 100;
        if (ileKlikniec < wpisowe) {
            $('#sbr-status').text('Za mało punktów! Wpisowe to ' + wpisowe + ' pkt.');
            return;
        }

        ileKlikniec -= wpisowe;
        $('#glowny-licznik').text(ileKlikniec);
        $('#licznik').text(ileKlikniec);

        wTrakcieWysciguSBR = true;
        $('#sbr-start').prop('disabled', true);
        $('.btn-sbr-faworyt').prop('disabled', true);

        audioSBRMuzyka.currentTime = 0;
        audioSBRMuzyka.play().catch(e => console.log("Autoplay muzyki SBR zablokowany"));
        $('#sbr-status').text('Wielki wyścig Steel Ball Run wystartował!');

        let pozycje = [0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
        let metaX = 425; 

        let pętlaSBR = setInterval(function() {
            for (let i = 1; i <= 10; i++) {
                pozycje[i] += Math.floor(Math.random() * 8) + 1;
                $('#sbr-koniu-' + i).css('left', pozycje[i] + 'px');
            }

            let zwyciezca = 0;
            for (let i = 1; i <= 10; i++) {
                if (pozycje[i] >= metaX) {
                    zwyciezca = i;
                    break;
                }
            }

            if (zwyciezca > 0) {
                clearInterval(pętlaSBR);
                
                audioSBRMuzyka.pause();
                audioSBRMuzyka.currentTime = 0;

                let imiona = [
                    '', 'Johnny Joestar', 'Gyro Zeppeli', 'Diego Brando', 'Hot Pants', 
                    'Ringo Roadagain', 'Mountain Tim', 'Wekapipo', 'Pocoloco', 'Sandman', 'Norisuke Higashikata'
                ];

                if (wybranySBR === zwyciezca) {
                    let nagroda = 10000;
                    ileKlikniec += nagroda;
                    $('#sbr-status').html(`WYGRANA! 🎉 ${imiona[zwyciezca]} wygrywa wyścig! (+${nagroda} pkt)`);

                    let audioSBRWygrana = new Audio('Fleetwood Mac - The Chain (Official Audio)_1.mp3');
                    audioSBRWygrana.play().catch(e => {});

                    if (czyJestWAlternatywnymUniwersum) {
                        setTimeout(uruchomPowrotDoGlownegoSwiata, 1500);
                    }

                } else {
                    if (!czyJestWAlternatywnymUniwersum) {
                        licznikPrzegranychSBR++;
                        $('#sbr-status').html(`PRZEGRANA (${licznikPrzegranychSBR})! 😢 Wygrał: ${imiona[zwyciezca]}.`);
                    } else {
                        $('#sbr-status').html(`PRZEGRANA w AU! 😢 Wygrał: ${imiona[zwyciezca]}. Wygrana jest wymagana, by uciec!`);
                    }

                    let audioSBRPrzegrana = new Audio('アニメ『スティール・ボール・ラン ジョジョの奇妙な冒険』ノンクレジットエンディング映像｜千葉雄喜 『死ぬか生きるか』_1.mp3');
                    audioSBRPrzegrana.play().catch(e => {});

                    if (licznikPrzegranychSBR === 6 && !czyJestWAlternatywnymUniwersum) {
                        setTimeout(uruchomPrzejscieDoAU, 1500);
                    }
                }

                $('#glowny-licznik').text(ileKlikniec);
                $('#licznik').text(ileKlikniec);
                sprawdzIRozszerzRekord();

                setTimeout(function() {
                    for (let i = 1; i <= 10; i++) {
                        $('#sbr-koniu-' + i).css('left', '5px');
                    }
                    wTrakcieWysciguSBR = false;
                    $('#sbr-start').prop('disabled', false);
                    $('.btn-sbr-faworyt').prop('disabled', false);
                    $('#sbr-status').text('Wybierz faworyta do kolejnego wyścigu!');
                }, 3500);
            }
        }, 70);
    });

    // --- PRZEJŚCIE DO AU Z RESETEM PUNKTÓW I SIŁY KLIKU DO 1 ---
    function uruchomPrzejscieDoAU() {
        czyJestWAlternatywnymUniwersum = true;

        ileKlikniec = 0;
        silaKlikniecia = 1;
        kosztSila = 10;
        kosztMoc10 = 150;
        kosztMoc100 = 1500;

        $('#glowny-licznik').text(ileKlikniec);
        $('#licznik').text(ileKlikniec);
        $('#koszt-sila').text(kosztSila);
        $('#koszt-moc-10').text(kosztMoc10);
        $('#koszt-moc-100').text(kosztMoc100);
        $('#moc-kliku-opisu').text(silaKlikniecia);
        
        ostatniSprawdzonyProgRuletki = 0;

        audioAUValentine.currentTime = 0;
        audioAUValentine.play().catch(e => console.log("Autoplay AU zablokowany"));

        let modalAUHtml = `
            <div id="modal-au" style="position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.92); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:white; padding:20px;">
                <h1 style="color: #ffcc00; text-shadow: 0 0 15px #ff0000; font-size: 2.2em; margin-bottom: 10px;">D4C!</h1>
                <p style="font-size: 1.2em; max-width: 600px; color: #d0e0ff; margin-bottom: 20px;">
                    <i>"My heart and actions are unclouded. They are all those of 'Justice'."</i><br>
                    Po 6 porażkach Funny Valentine przenosi całe Twoje otoczenie do Alternatywnego Uniwersum (AU)!<br>
                    <b>Gra zaczyna się od nowa! Punkty i siła kliknięcia zostały zresetowane. Aby uciec, musisz wygrać wyścig!</b>
                </p>
                <img src="d4c.jpg" alt="D4C & Flaga USA" style="width: 250px; height: 160px; object-fit: cover; border: 4px solid gold; border-radius: 10px; box-shadow: 0 0 30px rgba(255,215,0,0.6); margin-bottom: 25px;">
                <button id="btn-wejscie-au" style="padding: 12px 30px; background: #b14def; color: white; border: none; border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #b14def;">Wejdź do nowego Uniwersum</button>
            </div>
        `;
        $('body').append(modalAUHtml);

        $('#btn-wejscie-au').on('click', function() {
            audioAUValentine.pause();
            audioAUValentine.currentTime = 0;

            przelaczSwiatNaAU();
            $('#modal-au').fadeOut(500, function() { $(this).remove(); });
        });
    }

    // --- POWRÓT Z AU DO GŁÓWNEGO ŚWIATA PO WYGRANEJ ---
    function uruchomPowrotDoGlownegoSwiata() {
        czyJestWAlternatywnymUniwersum = false;
        licznikPrzegranychSBR = 0; 
        
        ileKlikniec = 0; 
        silaKlikniecia = 1;
        kosztSila = 10;
        kosztMoc10 = 150;
        kosztMoc100 = 1500;

        $('#glowny-licznik').text(ileKlikniec);
        $('#licznik').text(ileKlikniec);
        $('#koszt-sila').text(kosztSila);
        $('#koszt-moc-10').text(kosztMoc10);
        $('#koszt-moc-100').text(kosztMoc100);
        $('#moc-kliku-opisu').text(silaKlikniecia);
        
        ostatniSprawdzonyProgRuletki = 0;

        audioUcieczkaJohnny.currentTime = 0;
        audioUcieczkaJohnny.play().catch(e => console.log("Autoplay ucieczki Johnny'ego zablokowany"));

        let modalPowrotHtml = `
            <div id="modal-powrot" style="position:fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.92); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:white; padding:20px;">
                <h1 style="color: #00ffcc; text-shadow: 0 0 15px #00ffff; font-size: 2.2em; margin-bottom: 10px;">Ucieczka z Alternatywnego Uniwersum!</h1>
                <p style="font-size: 1.2em; max-width: 600px; color: #d0fffa; margin-bottom: 20px;">
                    <i>"Thank you Gyro"</i><br>
                    Udało Ci się wygrać wyścig! Johnny Joestar pomógł Ci przedrzeć się przez wymiary i wracasz do domu!
                </p>
                <img src="johnny.jpg" alt="Johnny Joestar" style="width: 260px; height: 160px; object-fit: cover; border: 4px solid #00ffcc; border-radius: 10px; box-shadow: 0 0 30px rgba(0,255,204,0.6); margin-bottom: 25px;">
                <button id="btn-powrot-swiat" style="padding: 12px 30px; background: #00bfff; color: white; border: none; border-radius: 8px; font-size: 1.2em; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #00bfff;">Wróć do Oryginalnego Świata</button>
            </div>
        `;
        $('body').append(modalPowrotHtml);

        $('#btn-powrot-swiat').on('click', function() {
            audioUcieczkaJohnny.pause();
            audioUcieczkaJohnny.currentTime = 0;

            przelaczSwiatNaGlowny();
            $('#modal-powrot').fadeOut(500, function() { $(this).remove(); });
        });
    }

    function przelaczSwiatNaAU() {
        $('#profil-gracza h2').text('Rozstrzelaj Zbrodniarzy itp. kliker');
        $('#sbr-kontener').css({
            'background': 'rgba(10, 25, 45, 0.95)',
            'border-color': '#00ffcc',
            'box-shadow': '0 0 25px rgba(0, 255, 204, 0.5)'
        });
        $('#sbr-status').text('Witamy w AU! Wygraj wyścig, aby uciec!');

        sprawdzObrazekIPoziom();
        sprawdzTlo();
        aktualizujSklep();
    }

    function przelaczSwiatNaGlowny() {
        $('#profil-gracza h2').text('Rozstrzelaj Mniejszości Etniczne kliker');
        $('#sbr-kontener').css({
            'background': 'rgba(25, 12, 40, 0.95)',
            'border-color': '#b14def',
            'box-shadow': '0 0 20px rgba(177, 77, 239, 0.5)'
        });
        $('#sbr-status').text('Powróciłeś do głównego świata. Wybierz faworyta!');

        sprawdzObrazekIPoziom();
        sprawdzTlo();
        aktualizujSklep();
    }

    function sprawdzCoKolejneProgi() {
        let progWymagany = ileKlikniec >= 75000 ? 50000 : 2000;
        let aktualnyProg = Math.floor(ileKlikniec / progWymagany) * progWymagany;

        if (aktualnyProg >= progWymagany && aktualnyProg > ostatniSprawdzonyProgRuletki && $('#minigra-modal').length === 0) {
            ostatniSprawdzonyProgRuletki = aktualnyProg;
            
            let czyPojawicRuletke = Math.random() < 0.1;

            if (czyPojawicRuletke) {
                if (czyJestWAlternatywnymUniwersum) {
                    uruchomMinigreRuletkiAU();
                } else {
                    uruchomMinigreRuletki();
                }
            }
        }
    }

    // --- ORYGINALNA RULETKA (GŁÓWNY ŚWIAT) ---
    function uruchomMinigreRuletki() {
        let audioWejscie = new Audio('Hava Nagila_1.mp3'); 
        audioWejscie.loop = true;
        audioWejscie.play().catch(e => console.log("Autoplay zablokowany"));

        let modalHtml = `
            <div id="minigra-modal">
                <div id="minigra-kontent">
                    <h3>Wyzwanie Ruletki!</h3>
                    <p>Zakręć kołem i zmierz się z losem!</p>
                    
                    <img id="obrazek-minigry" src="ruletazyd.jpg" alt="Postać w ruletce" style="width: 80px; height: 80px; object-fit: contain;">
                    
                    <div id="kolo-ruletki-kontener">
                        <div id="wskaznik-kola"></div>
                        <div id="kolo-ruletki"></div>
                    </div>
                    
                    <p id="wynik-tekst"><b>Wygrywasz:</b> +1.5x Twoich punktów | <b>Przegrywasz:</b> -50% pkt</p>
                    <button id="btn-losuj">Zakręć kołem!</button>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        $('#btn-losuj').on('click', function() {
            $(this).prop('disabled', true);
            
            let wygrana = Math.random() < 0.5;
            let docelowyKat = wygrana ? (1440 + Math.floor(Math.random() * 160) + 190) : (1440 + Math.floor(Math.random() * 160) + 10);
            
            $('#kolo-ruletki').css('transform', `rotate(${docelowyKat}deg)`);

            setTimeout(function() {
                if (wygrana) {
                    let bonusPunkty = Math.floor(ileKlikniec * 1.5);
                    ileKlikniec += bonusPunkty;

                    $('#minigra-kontent h3').text('WYGRANA! 🎉');
                    $('#wynik-tekst').html(`Brawo! Zyskujesz potężny bonus <b>+${bonusPunkty} pkt</b> (1.5x Twojego stanu)!`);

                    let audioWygrana = new Audio('Hitler_s speech meine arbeit_1_1.mp3');
                    audioWygrana.play().catch(e => {});

                } else {
                    $('#minigra-kontent h3').text('PRZEGRANA! 😢');
                    let strata = Math.floor(ileKlikniec / 2);
                    ileKlikniec -= strata;
                    $('#wynik-tekst').html('Niestety! Straciłeś połowę punktów (-' + strata + ' pkt).');

                    let audioPrzegrana = new Audio('Jackpot_1.mp3');
                    audioPrzegrana.play().catch(e => {});
                }

                $('#glowny-licznik').text(ileKlikniec);
                $('#licznik').text(ileKlikniec);
                sprawdzIRozszerzRekord();

                setTimeout(function() {
                    let modalRect = document.getElementById('minigra-kontent').getBoundingClientRect();
                    
                    let $zydWedrujacy = $('<img src="ruletazyd.jpg" class="postac-w-ruchu">').css({
                        position: 'fixed',
                        left: (modalRect.left + modalRect.width / 2 - 40) + 'px',
                        top: (modalRect.top + 30) + 'px',
                        width: '80px',
                        height: '80px',
                        'object-fit': 'contain',
                        'z-index': '10000',
                        transition: 'all 1.5s ease-in-out'
                    });

                    $('#konteneranimacji-ruletki').append($zydWedrujacy);
                    $('#minigra-modal').fadeOut(300, function() { $(this).remove(); });

                    setTimeout(function() {
                        let docelowyLeft = 120;
                        let docelowyTop = window.innerHeight / 2 - 70;

                        $zydWedrujacy.css({
                            left: docelowyLeft + 'px',
                            top: docelowyTop + 'px'
                        });

                        setTimeout(function() {
                            if (wygrana) {
                                let $drugiObrazek = $('<img src="auschwitz.jpg" alt="Drugie miejsce">').css({
                                    position: 'fixed',
                                    left: docelowyLeft + 'px',
                                    top: docelowyTop + 'px',
                                    width: '140px',
                                    height: '140px',
                                    'object-fit': 'contain',
                                    'z-index': '10000',
                                    opacity: '0',
                                    transform: 'scale(0.5)',
                                    transition: 'all 0.5s ease'
                                });

                                $('#konteneranimacji-ruletki').append($drugiObrazek);
                                
                                setTimeout(() => {
                                    $drugiObrazek.css({ opacity: '1', transform: 'scale(1)' });
                                }, 50);

                                setTimeout(function() {
                                    $zydWedrujacy.addClass('spalanie-na-popiol');
                                    
                                    setTimeout(() => {
                                        $zydWedrujacy.remove();
                                        
                                        setTimeout(() => {
                                            $drugiObrazek.css({ transition: 'opacity 0.8s ease', opacity: '0' });
                                            setTimeout(() => {
                                                $drugiObrazek.remove();
                                                audioWejscie.pause();
                                                audioWejscie.currentTime = 0;
                                            }, 800);
                                        }, 1500);

                                    }, 1200);
                                }, 500);

                            } else {
                                $zydWedrujacy.css({ transition: 'opacity 0.5s ease', opacity: '0' });
                                setTimeout(() => {
                                    $zydWedrujacy.remove();
                                    audioWejscie.pause();
                                    audioWejscie.currentTime = 0;
                                }, 500);
                            }

                        }, 1500);

                    }, 50);

                }, 2000);

            }, 3000);
        });
    }

    // --- RULETKA DLA AU ---
    function uruchomMinigreRuletkiAU() {
        let audioWejscieAU = new Audio('Erika German song.mp3'); 
        audioWejscieAU.loop = true;
        audioWejscieAU.play().catch(e => console.log("Autoplay zablokowany"));

        let modalHtml = `
            <div id="minigra-modal">
                <div id="minigra-kontent" style="border-color: #00ffcc; box-shadow: 0 0 25px rgba(0, 255, 204, 0.8);">
                    <h3 style="color: #00ffcc;">Ruletka Alternatywnego Uniwersum!</h3>
                    <p>Zaryzykuj w Alternatywnym Uniwersum!</p>
                    
                    <img id="obrazek-minigry" src="Adolf-Hitler-1933.jpg" alt="Postać w ruletce AU" style="width: 80px; height: 80px; object-fit: contain;">
                    
                    <div id="kolo-ruletki-kontener">
                        <div id="wskaznik-kola"></div>
                        <div id="kolo-ruletki" style="border-color: #00ffcc; background: conic-gradient(#00ffcc 0deg 180deg, #b14def 180deg 360deg);"></div>
                    </div>
                    
                    <p id="wynik-tekst"><b>Wygrywasz:</b> +2x Twoich punktów | <b>Przegrywasz:</b> Reset pkt do 0</p>
                    <button id="btn-losuj-au" style="background-color: #00ffcc; color: #02050a;">Zakręć kołem AU!</button>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        $('#btn-losuj-au').on('click', function() {
            $(this).prop('disabled', true);
            
            let wygrana = Math.random() < 0.5;
            let docelowyKat = wygrana ? (1440 + Math.floor(Math.random() * 160) + 190) : (1440 + Math.floor(Math.random() * 160) + 10);
            
            $('#kolo-ruletki').css('transform', `rotate(${docelowyKat}deg)`);

            setTimeout(function() {
                if (wygrana) {
                    let bonusPunkty = ileKlikniec > 0 ? ileKlikniec : 500;
                    ileKlikniec += bonusPunkty;

                    $('#minigra-kontent h3').text('WYGRANA! 🎉');
                    $('#wynik-tekst').html(`Niesamowite! Zyskujesz <b>+${bonusPunkty} pkt</b> w Alternatywnym Uniwersum!`);

                    let audioWygrana = new Audio('Nein_1.mp3');
                    audioWygrana.play().catch(e => {});

                } else {
                    $('#minigra-kontent h3').text('PRZEGRANA! 😢');
                    ileKlikniec = 0; 
                    $('#wynik-tekst').html('Wymiar Cię odrzucił! Twoje punkty spadły do <b>0</b>.');

                    let audioPrzegrana = new Audio('Jackpot_1.mp3');
                    audioPrzegrana.play().catch(e => {});
                }

                $('#glowny-licznik').text(ileKlikniec);
                $('#licznik').text(ileKlikniec);
                sprawdzIRozszerzRekord();

                setTimeout(function() {
                    $('#minigra-modal').fadeOut(300, function() { 
                        $(this).remove(); 
                        audioWejscieAU.pause();
                        audioWejscieAU.currentTime = 0;
                    });
                }, 2500);

            }, 3000);
        });
    }

    function sprawdzTlo() {
        // Usuwamy klasy wszystkich teł z obu światów
        $('body').removeClass('tlo-poziom-500 tlo-poziom-2000 tlo-poziom-10000 tlo-poziom-50000 au-tlo-poziom-0 au-tlo-poziom-200 au-tlo-poziom-500 au-tlo-poziom-1000 au-tlo-poziom-2000 au-tlo-poziom-5000 au-tlo-poziom-10000 au-tlo-poziom-20000 au-tlo-poziom-50000 au-tlo-poziom-100000 au-tlo-poziom-250000');

        if (!czyJestWAlternatywnymUniwersum) {
            if (ileKlikniec >= 10000 && ileKlikniec < 50000) {
                if (audioMuzyka10k.paused) {
                    audioMuzyka10k.play().catch(e => console.log("Autoplay muzyki 10k zablokowany"));
                }
            } else {
                if (!audioMuzyka10k.paused) {
                    audioMuzyka10k.pause();
                    audioMuzyka10k.currentTime = 0;
                }
            }

            if (ileKlikniec >= 50000) {
                $('body').addClass('tlo-poziom-50000');
            } else if (ileKlikniec >= 10000) {
                $('body').addClass('tlo-poziom-10000');
            } else if (ileKlikniec >= 2000) {
                $('body').addClass('tlo-poziom-2000');
            } else if (ileKlikniec >= 500) {
                $('body').addClass('tlo-poziom-500');
            }

        } else {
            // Muzyka w tle AU gra od 10k punktów (lub możesz zmienić warunek)
            if (ileKlikniec >= 10000) {
                if (audioMuzykaAU.paused) {
                    audioMuzykaAU.play().catch(e => console.log("Autoplay muzyki AU zablokowany"));
                }
            } else {
                if (!audioMuzykaAU.paused) {
                    audioMuzykaAU.pause();
                    audioMuzykaAU.currentTime = 0;
                }
            }

            // --- ZAKTUALIZOWANE PROGI TŁA DLA AU (WSZYSTKIE 11 POZIOMÓW) ---
            if (ileKlikniec >= 250000) {
                $('body').addClass('au-tlo-poziom-250000');
            } else if (ileKlikniec >= 100000) {
                $('body').addClass('au-tlo-poziom-100000');
            } else if (ileKlikniec >= 50000) {
                $('body').addClass('au-tlo-poziom-50000');
            } else if (ileKlikniec >= 20000) {
                $('body').addClass('au-tlo-poziom-20000');
            } else if (ileKlikniec >= 10000) {
                $('body').addClass('au-tlo-poziom-10000');
            } else if (ileKlikniec >= 5000) {
                $('body').addClass('au-tlo-poziom-5000');
            } else if (ileKlikniec >= 2000) {
                $('body').addClass('au-tlo-poziom-2000');
            } else if (ileKlikniec >= 1000) {
                $('body').addClass('au-tlo-poziom-1000');
            } else if (ileKlikniec >= 500) {
                $('body').addClass('au-tlo-poziom-500');
            } else if (ileKlikniec >= 200) {
                $('body').addClass('au-tlo-poziom-200');
            } else {
                $('body').addClass('au-tlo-poziom-0');
            }
        }
    }

    function sprawdzObrazekIPoziom() {
        let aktywnaListaProgow = czyJestWAlternatywnymUniwersum ? progiObrazkowAU : progiObrazkowGlownych;

        let nowyIndeks = 0;
        for (let i = aktywnaListaProgow.length - 1; i >= 0; i--) {
            if (ileKlikniec >= aktywnaListaProgow[i].prog) {
                nowyIndeks = i;
                break;
            }
        }

        if (aktualnyIndeksProgu !== nowyIndeks) {
            aktualnyIndeksProgu = nowyIndeks;
            
            $('#moj-obrazek').attr('src', aktywnaListaProgow[nowyIndeks].url);
            $('#tekst-wewnatrz').text(aktywnaListaProgow[nowyIndeks].nazwa);

            $('#moj-obrazek').css('transform', 'scale(1.3)');
            setTimeout(function() {
                $('#moj-obrazek').css('transform', 'scale(1)');
            }, 250);
        }
    }

    function sprawdzIRozszerzRekord() {
        if (ileKlikniec > najlepszyWynik) {
            najlepszyWynik = ileKlikniec;
            $('#najlepszy-wynik').text(najlepszyWynik);
            localStorage.setItem('kliker_rekord', najlepszyWynik);
        }

        let graczIndex = ranking.findIndex(item => item.nick === nickGracza);
        if (graczIndex !== -1) {
            if (ileKlikniec > ranking[graczIndex].punkty) {
                ranking[graczIndex].punkty = ileKlikniec;
            }
        } else {
            ranking.push({ nick: nickGracza, punkty: ileKlikniec });
        }

        ranking.sort((a, b) => b.punkty - a.punkty);
        ranking = ranking.slice(0, 5);

        localStorage.setItem('kliker_ranking', JSON.stringify(ranking));
        odswiezTabeleWynikow();
    }

    function odswiezTabeleWynikow() {
        $('#lista-wynikow').empty();
        ranking.forEach(function(item) {
            $('#lista-wynikow').append('<li>' + item.nick + ': ' + item.punkty + ' pkt</li>');
        });
    }

    // Zakup +1 do kliku
    $('#kup-sila').on('click', function() {
        if (ileKlikniec >= kosztSila) {
            ileKlikniec -= kosztSila;
            silaKlikniecia += 1;
            kosztSila = Math.round(kosztSila * 1.5);

            $('#glowny-licznik').text(ileKlikniec);
            $('#licznik').text(ileKlikniec);
            $('#koszt-sila').text(kosztSila);
            $('#moc-kliku-opisu').text(silaKlikniecia);
            
            sprawdzObrazekIPoziom();
            sprawdzCoKolejneProgi();
            sprawdzTlo();
            aktualizujSklep();
        }
    });

    // Zakup +10 do kliku
    $('#kup-moc-10').on('click', function() {
        if (ileKlikniec >= kosztMoc10) {
            ileKlikniec -= kosztMoc10;
            silaKlikniecia += 10;
            kosztMoc10 = Math.round(kosztMoc10 * 1.6);

            $('#glowny-licznik').text(ileKlikniec);
            $('#licznik').text(ileKlikniec);
            $('#koszt-moc-10').text(kosztMoc10);
            $('#moc-kliku-opisu').text(silaKlikniecia);
            
            sprawdzObrazekIPoziom();
            sprawdzCoKolejneProgi();
            sprawdzTlo();
            aktualizujSklep();
        }
    });

    // Zakup +100 do kliku
    $('#kup-moc-100').on('click', function() {
        if (ileKlikniec >= kosztMoc100) {
            ileKlikniec -= kosztMoc100;
            silaKlikniecia += 100;
            kosztMoc100 = Math.round(kosztMoc100 * 1.7);

            $('#glowny-licznik').text(ileKlikniec);
            $('#licznik').text(ileKlikniec);
            $('#koszt-moc-100').text(kosztMoc100);
            $('#moc-kliku-opisu').text(silaKlikniecia);
            
            sprawdzObrazekIPoziom();
            sprawdzCoKolejneProgi();
            sprawdzTlo();
            aktualizujSklep();
        }
    });

    function aktualizujSklep() {
        $('#kup-sila').prop('disabled', ileKlikniec < kosztSila);
        $('#kup-moc-10').prop('disabled', ileKlikniec < kosztMoc10);
        $('#kup-moc-100').prop('disabled', ileKlikniec < kosztMoc100);
    }

    function pokaźAnimacjePlus(e) {
        let offset = $('#obszar').offset();
        let x = e.pageX - offset.left;
        let y = e.pageY - offset.top;

        let $plus = $('<span></span>')
            .addClass('plus-animacja')
            .text('+' + silaKlikniecia)
            .css({ left: x + 'px', top: y + 'px' });

        $('#obszar').append($plus);

        setTimeout(function() {
            $plus.remove();
        }, 800);
    }

    sprawdzObrazekIPoziom();
    sprawdzTlo();
    aktualizujSklep();
});
