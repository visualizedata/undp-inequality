BEGIN{FS=OFS=","}
{
	if(FILENAME == "aglandsqkm.csv"){
		printf "%s,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d\n", $1,$56, (getline < "electricity.csv" > "trashout.txt") $57, (getline < "foodimport.csv">"trashout.txt") $58, (getline < "sqkm.csv">"trashout.txt") $60, (getline < "slums.csv">"trashout.txt") $60, (getline < "percentpopinCity.csv">"trashout.txt") $60, (getline < "population.csv">"trashout.txt") $60, (getline < "giniddupe.csv">"trashout.txt") $5, (getline < "GDP.csv">"trashout.txt") $60, (getline < "GDPpcap.csv">"trashout.txt") $60, (getline < "agvalue.csv">"trashout.txt") $60, (getline < "foreigninvest.csv">"trashout.txt") $59
	}

}
#FILENAME=="aglandsqkm.csv"{print $1,$56};FILENAME=="electricity.csv"{print $57}
