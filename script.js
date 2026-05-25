function toggleModal(show) {
            const modal = document.getElementById('instructionModal');
            if(show) {
                modal.classList.add('open');
            } else {
                modal.classList.remove('open');
            }
        }

        async function compareLists() {
            const followersInput = document.getElementById('followersFile').files[0];
            const followingInput = document.getElementById('followingFile').files[0];
            const appShell = document.getElementById('appShell');
            const resultsDiv = document.getElementById('results');

            if (!followersInput || !followingInput) {
                alert("Please drop/select both JSON system profile exports first.");
                return;
            }

            const followersText = await followersInput.text();
            const followingText = await followingInput.text();

            const extractUsernames = (jsonString) => {
                const usernames = new Set();
                const urlMatches = [...jsonString.matchAll(/instagram\.com\/(?:_u\/)?([a-zA-Z0-9_.]+)/g)];

                urlMatches.forEach(match => {
                    const username = match[1].toLowerCase();
                    const ignoreList = ['p', 'reel', 'reels', 'stories', 'explore', 'direct', 'tv'];
                    if (!ignoreList.includes(username)) {
                        usernames.add(username);
                    }
                });
                return usernames;
            };

            const followersSet = extractUsernames(followersText);
            const followingSet = extractUsernames(followingText);

            const notFollowingBack = [];
            for (let user of followingSet) {
                if (!followersSet.has(user)) {
                    notFollowingBack.push(user);
                }
            }

            const notFollowingThem = [];
            for (let user of followersSet) {
                if (!followingSet.has(user)) {
                    notFollowingThem.push(user);
                }
            }

            notFollowingBack.sort();
            notFollowingThem.sort();

            appShell.classList.add('expanded');

            let outputHTML = `
                <div class="diagnostics">
                    <div class="metric">
                        <span class="metric-val">${followersSet.size}</span>
                        <span class="metric-lbl">Followers</span>
                    </div>
                    <div class="metric" style="border-left: 1px solid rgba(255,255,255,0.15); border-right: 1px solid rgba(255,255,255,0.15);">
                        <span class="metric-val">${followingSet.size}</span>
                        <span class="metric-lbl">Following</span>
                    </div>
                    <div class="metric">
                        <span class="metric-val" style="color: #ff808f">${notFollowingBack.length}</span>
                        <span class="metric-lbl">Non-Mutual</span>
                    </div>
                </div>

                <div class="results-grid">
                    <div class="list-card unfollowers">
                        <div class="list-card-header">
                            <span>Not Following You Back</span>
                            <span class="badge">${notFollowingBack.length}</span>
                        </div>
                        <div class="search-wrapper">
                            <input type="text" class="search-input" placeholder="Filter list via identity..." oninput="filterColumn(this)">
                        </div>
                        <ul class="list-scroll">
            `;
            
            if(notFollowingBack.length === 0) {
                outputHTML += `<li class="empty-state">Perfect balance! Everyone follows back. 🎉</li>`;
            } else {
                notFollowingBack.forEach(user => {
                    outputHTML += `<li><a href="https://instagram.com/${user}" target="_blank">@${user}</a></li>`;
                });
            }
            outputHTML += `</ul></div>`;

            outputHTML += `
                    <div class="list-card fans">
                        <div class="list-card-header">
                            <span>You Aren't Following Back</span>
                            <span class="badge">${notFollowingThem.length}</span>
                        </div>
                        <div class="search-wrapper">
                            <input type="text" class="search-input" placeholder="Filter list via identity..." oninput="filterColumn(this)">
                        </div>
                        <ul class="list-scroll">
            `;
            
            if(notFollowingThem.length === 0) {
                outputHTML += `<li class="empty-state">No fans or pending followbacks detected.</li>`;
            } else {
                notFollowingThem.forEach(user => {
                    outputHTML += `<li><a href="https://instagram.com/${user}" target="_blank">@${user}</a></li>`;
                });
            }
            outputHTML += `</ul></div></div>`;

            resultsDiv.innerHTML = outputHTML;
            
            setTimeout(() => {
                resultsDiv.classList.add('visible');
            }, 50);
        }

        function filterColumn(inputElement) {
            const query = inputElement.value.toLowerCase();
            const listCard = inputElement.closest('.list-card');
            const items = listCard.querySelectorAll('.list-scroll li:not(.empty-state)');
            
            items.forEach(item => {
                const username = item.textContent.toLowerCase();
                if(username.includes(query)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        }