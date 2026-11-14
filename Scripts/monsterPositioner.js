const monster = document.getElementById("bg-skill-monster");
const skillsElement = document.getElementById("skills-container");

function positionMonster()
{
    let rect = skillsElement.getBoundingClientRect();
    if(rect.height < rect.width)
    {
        monster.style.height = `${rect.height}px`;
    }
    else
    {
        monster.style.width = `${rect.width}px`
    }

    let offset = (skillsElement.clientWidth / 2) - (monster.clientWidth / 2);

    monster.style.top = `${rect.top + window.scrollY}px`;
    monster.style.left = `${rect.left + window.scrollX + offset}px`;
}

window.addEventListener("load", positionMonster);
window.addEventListener("resize", positionMonster);
