def main():
    file = open('words.txt', 'r')
    file2 = open('words.json', 'w')
    file2.write('{\n\t"words": [\n')
    for line in file:
        s = "\t\t\"%s\",\n" % line[:-1]
        file2.write(s)
    file2.write('\t]\n}')
main()
